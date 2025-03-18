namespace MyDotNetApp.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public int UserId { get; set; }
        public string? Description { get; set; }
        public string? CategoryImageUrl { get; set; }
        public string? Name { get; set; } // Category name
    }

    public class ExpenseCreateDto
    {
        public int CategoryId { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public int UserId { get; set; }
        public string? Description { get; set; }
    }
}