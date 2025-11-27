namespace Backend.DTOs
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? ProfileImagePath { get; set; }
    }
}