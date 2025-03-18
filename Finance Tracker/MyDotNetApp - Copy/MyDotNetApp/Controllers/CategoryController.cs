using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using MyDotNetApp.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyDotNetApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly MySqlConnection _connection;

        public CategoriesController(MySqlConnection connection)
        {
            _connection = connection;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                await _connection.OpenAsync();

                var query = "SELECT id, name, image AS category_image_url FROM categories";
                using var command = new MySqlCommand(query, _connection);
                using var reader = await command.ExecuteReaderAsync();

                var categories = new List<Category>();

                while (await reader.ReadAsync())
                {
                    categories.Add(new Category
                    {
                        Id = reader.GetInt32("id"),
                        Name = reader.GetString("name"),
                        CategoryImageUrl = reader.IsDBNull(reader.GetOrdinal("category_image_url")) 
                            ? null 
                            : reader.GetString("category_image_url")
                    });
                }

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve categories", error = ex.Message });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }
    }

    // Define a Category model (you can place this in Models folder)
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string CategoryImageUrl { get; set; }
    }
}