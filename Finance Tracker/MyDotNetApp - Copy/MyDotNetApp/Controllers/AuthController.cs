using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using MyDotNetApp.Models;
using Microsoft.Extensions.Configuration;
using BCrypt.Net;

namespace MyDotNetApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MySqlConnection _connection;
        private readonly IConfiguration _config;

        public AuthController(MySqlConnection connection, IConfiguration config)
        {
            _connection = connection;
            _config = config;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            try
            {
                if (login == null || string.IsNullOrEmpty(login.Email) || string.IsNullOrEmpty(login.Password))
                    return BadRequest(new { Message = "Email and password are required." });

                await _connection.OpenAsync();

                // Get user with hashed password
                using var command = new MySqlCommand(
                    "SELECT * FROM users WHERE email = @email",
                    _connection);
                command.Parameters.AddWithValue("@email", login.Email);

                using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    return Unauthorized(new { Message = "Email not found." });
                }

                var user = new User
                {
                    Id = reader.GetInt32("id"),
                    FullName = reader.GetString("full_name"),
                    Email = reader.GetString("email"),
                    Password = reader.GetString("password") // This is the hashed password
                };

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
                {
                    return Unauthorized(new { Message = "Incorrect password." });
                }

                var token = GenerateJwtToken(user);
                return Ok(new
                {
                    Token = token,
                    UserId = user.Id,
                    FullName = user.FullName,
                    Email = user.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Login failed", Error = ex.Message });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            try
            {
                if (user == null || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Password))
                    return BadRequest(new { Message = "Email and password are required." });

                await _connection.OpenAsync();

                // Check if email exists
                using var checkCommand = new MySqlCommand(
                    "SELECT COUNT(*) FROM users WHERE email = @email",
                    _connection);
                checkCommand.Parameters.AddWithValue("@email", user.Email);
                var emailExists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;
                if (emailExists)
                {
                    return BadRequest(new { Message = "Email already registered" });
                }

                // Hash password and create user
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);
                using var command = new MySqlCommand(
                    "INSERT INTO users (full_name, email, password) VALUES (@fullName, @email, @password)",
                    _connection);
                command.Parameters.AddWithValue("@fullName", user.FullName);
                command.Parameters.AddWithValue("@email", user.Email);
                command.Parameters.AddWithValue("@password", hashedPassword);
                
                await command.ExecuteNonQueryAsync();

                var createdUser = new
                {
                    Id = command.LastInsertedId,
                    FullName = user.FullName,
                    Email = user.Email
                };

                return CreatedAtAction(nameof(Login), new { email = createdUser.Email }, createdUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Registration failed", Error = ex.Message });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing in configuration.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}