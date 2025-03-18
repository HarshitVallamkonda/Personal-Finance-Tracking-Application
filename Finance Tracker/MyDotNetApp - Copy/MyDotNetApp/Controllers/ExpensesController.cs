using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using MyDotNetApp.Models; // Ensure this namespace includes your Expense and ExpenseCreateDto models
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyDotNetApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpensesController : ControllerBase
    {
        private readonly MySqlConnection _connection;

        public ExpensesController(MySqlConnection connection)
        {
            _connection = connection;
        }

        // POST: Create Expense
        [HttpPost]
        public async Task<IActionResult> CreateExpense([FromBody] ExpenseCreateDto expenseDto)
        {
            try
            {
                await _connection.OpenAsync();

                if (expenseDto.UserId <= 0)
                {
                    return BadRequest(new { message = "Invalid or missing userId" });
                }

                using var command = new MySqlCommand(
                    "INSERT INTO expenses (category_id, amount, date, user_id, description) VALUES (@categoryId, @amount, @date, @userId, @description)",
                    _connection);
                command.Parameters.AddWithValue("@categoryId", expenseDto.CategoryId);
                command.Parameters.AddWithValue("@amount", expenseDto.Amount);
                command.Parameters.AddWithValue("@date", expenseDto.Date.Date);
                command.Parameters.AddWithValue("@userId", expenseDto.UserId);
                command.Parameters.AddWithValue("@description", expenseDto.Description);

                await command.ExecuteNonQueryAsync();
                int newId = (int)command.LastInsertedId;

                var expense = new Expense
                {
                    Id = newId,
                    CategoryId = expenseDto.CategoryId,
                    Amount = expenseDto.Amount,
                    Date = expenseDto.Date,
                    UserId = expenseDto.UserId,
                    Description = expenseDto.Description
                };

                return CreatedAtAction(nameof(GetExpenses), new { id = expense.Id }, expense);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create expense", error = ex.Message });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        // GET: Fetch Expenses
        [HttpGet]
        public async Task<IActionResult> GetExpenses([FromQuery] DateTime? date, [FromQuery] int? categoryId, [FromQuery] int? userId)
        {
            try
            {
                await _connection.OpenAsync();

                var query = @"
                    SELECT e.*, 
                           c.name AS name, 
                           c.image AS category_image_url
                    FROM expenses e
                    LEFT JOIN categories c ON e.category_id = c.id";
                var conditions = new List<string>();
                var parameters = new List<MySqlParameter>();

                if (date.HasValue)
                {
                    conditions.Add("e.date = @date");
                    parameters.Add(new MySqlParameter("@date", date.Value.Date));
                }

                if (categoryId.HasValue)
                {
                    conditions.Add("e.category_id = @categoryId");
                    parameters.Add(new MySqlParameter("@categoryId", categoryId.Value));
                }

                if (userId.HasValue && userId.Value > 0)
                {
                    conditions.Add("e.user_id = @userId");
                    parameters.Add(new MySqlParameter("@userId", userId.Value));
                }

                if (conditions.Count > 0)
                {
                    query += " WHERE " + string.Join(" AND ", conditions);
                }

                using var command = new MySqlCommand(query, _connection);
                foreach (var param in parameters)
                {
                    command.Parameters.Add(param);
                }

                using var reader = await command.ExecuteReaderAsync();
                var expenses = new List<Expense>();

                while (await reader.ReadAsync())
                {
                    expenses.Add(new Expense
                    {
                        Id = reader.GetInt32("id"),
                        CategoryId = reader.GetInt32("category_id"),
                        Amount = reader.GetDecimal("amount"),
                        Date = reader.GetDateTime("date"),
                        UserId = reader.GetInt32("user_id"),
                        Description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString("description"),
                        CategoryImageUrl = reader.IsDBNull(reader.GetOrdinal("category_image_url")) ? null : reader.GetString("category_image_url"),
                        Name = reader.IsDBNull(reader.GetOrdinal("name")) ? null : reader.GetString("name")
                    });
                }

                return Ok(expenses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve expenses", error = ex.Message });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        // PUT: Update Expense
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] Expense expense)
        {
            try
            {
                await _connection.OpenAsync();

                if (id != expense.Id)
                {
                    return BadRequest(new { message = "Expense ID mismatch" });
                }

                using var command = new MySqlCommand(
                    "UPDATE expenses SET category_id = @categoryId, amount = @amount, date = @date, description = @description WHERE id = @id",
                    _connection);
                command.Parameters.AddWithValue("@id", expense.Id);
                command.Parameters.AddWithValue("@categoryId", expense.CategoryId);
                command.Parameters.AddWithValue("@amount", expense.Amount);
                command.Parameters.AddWithValue("@date", expense.Date.Date);
                command.Parameters.AddWithValue("@description", expense.Description);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                {
                    return NotFound(new { message = "Expense not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update expense", error = ex.Message });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        // DELETE: Delete Expense
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            try
            {
                await _connection.OpenAsync();

                using var command = new MySqlCommand(
                    "DELETE FROM expenses WHERE id = @id",
                    _connection);
                command.Parameters.AddWithValue("@id", id);

                var rowsAffected = await command.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                {
                    return NotFound(new { message = "Expense not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete expense", error = ex.Message });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }
    }
}