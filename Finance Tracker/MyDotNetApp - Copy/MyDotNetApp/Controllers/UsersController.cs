using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using MyDotNetApp.Models;
using BCrypt.Net; // Add this for password hashing

namespace MyDotNetApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Applies to all actions except where overridden
    public class UsersController : ControllerBase
    {
        private readonly MySqlConnection _connection;

        public UsersController(MySqlConnection connection)
        {
            _connection = connection;
        }

        // Public Registration Endpoint
        [HttpPost("register")]
        [AllowAnonymous] // Allow unauthenticated access
        public async Task<IActionResult> Register([FromBody] User user)
        {
            try
            {
                await _connection.OpenAsync();

                // Check if email already exists
                using var checkCommand = new MySqlCommand("SELECT COUNT(*) FROM users WHERE email = @email", _connection);
                checkCommand.Parameters.AddWithValue("@email", user.Email);
                var emailExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;
                if (emailExists)
                {
                    return BadRequest(new { message = "Email already registered" });
                }

                // Hash the password
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);

                // Insert new user
                using var command = new MySqlCommand(
                    "INSERT INTO users (full_name, email, password) VALUES (@full_name, @email, @password)",
                    _connection);
                command.Parameters.AddWithValue("@full_name", user.FullName);
                command.Parameters.AddWithValue("@email", user.Email);
                command.Parameters.AddWithValue("@password", hashedPassword); // Store hashed password
                await command.ExecuteNonQueryAsync();

                // Return the created user (without password)
                var createdUser = new
                {
                    Id = command.LastInsertedId,
                    FullName = user.FullName,
                    Email = user.Email
                };
                return CreatedAtAction(nameof(Get), new { id = createdUser.Id }, createdUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Registration failed", error = ex.Message });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        // Existing CRUD Actions (unchanged except for connection handling)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                await _connection.OpenAsync();
                using var command = new MySqlCommand("SELECT * FROM users", _connection);
                using var reader = await command.ExecuteReaderAsync();
                var users = new List<User>();
                while (await reader.ReadAsync())
                {
                    users.Add(new User
                    {
                        Id = reader.GetInt32("id"),
                        FullName = reader.GetString("full_name"),
                        Email = reader.GetString("email"),
                        Password = reader.GetString("password") // Note: Avoid returning this in production
                    });
                }
                return Ok(users);
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                await _connection.OpenAsync();
                using var command = new MySqlCommand("SELECT * FROM users WHERE id = @id", _connection);
                command.Parameters.AddWithValue("@id", id);
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return Ok(new User
                    {
                        Id = reader.GetInt32("id"),
                        FullName = reader.GetString("full_name"),
                        Email = reader.GetString("email"),
                        Password = reader.GetString("password") // Note: Avoid returning this in production
                    });
                }
                return NotFound();
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User user)
        {
            try
            {
                await _connection.OpenAsync();
                using var command = new MySqlCommand(
                    "INSERT INTO users (full_name, email, password) VALUES (@full_name, @email, @password)",
                    _connection);
                command.Parameters.AddWithValue("@full_name", user.FullName);
                command.Parameters.AddWithValue("@email", user.Email);
                command.Parameters.AddWithValue("@password", BCrypt.Net.BCrypt.HashPassword(user.Password));
                await command.ExecuteNonQueryAsync();
                return CreatedAtAction(nameof(Get), new { id = command.LastInsertedId }, user);
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] User user)
        {
            try
            {
                await _connection.OpenAsync();
                using var command = new MySqlCommand(
                    "UPDATE users SET full_name = @full_name, email = @email, password = @password WHERE id = @id",
                    _connection);
                command.Parameters.AddWithValue("@id", id);
                command.Parameters.AddWithValue("@full_name", user.FullName);
                command.Parameters.AddWithValue("@email", user.Email);
                command.Parameters.AddWithValue("@password", BCrypt.Net.BCrypt.HashPassword(user.Password));
                var rows = await command.ExecuteNonQueryAsync();
                return rows > 0 ? NoContent() : NotFound();
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _connection.OpenAsync();
                using var command = new MySqlCommand("DELETE FROM users WHERE id = @id", _connection);
                command.Parameters.AddWithValue("@id", id);
                var rows = await command.ExecuteNonQueryAsync();
                return rows > 0 ? NoContent() : NotFound();
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }
    }
}