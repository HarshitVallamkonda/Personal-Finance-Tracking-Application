namespace MyDotNetApp.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string FullName { get; set; }    // Changed from Name to FullName
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class LoginRequest
    {
        public required string Email { get; set; }       // Unchanged, still uses email
        public required string Password { get; set; }
    }
}