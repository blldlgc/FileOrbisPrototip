using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly FileService _fileService;

        public UsersController(AppDbContext context, FileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    ProfileImagePath = u.ProfileImagePath
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                ProfileImagePath = user.ProfileImagePath
            };

            return Ok(userDto);
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> CreateUser([FromForm] CreateUserDto createUserDto)
        {
            // Email kontrolü
            if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
            {
                return BadRequest("Bu email adresi zaten kullanılıyor.");
            }

            // Profil resmini kaydet
            string? profileImagePath = null;
            try
            {
                profileImagePath = await _fileService.SaveProfileImageAsync(createUserDto.ProfileImage);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }

            // Password hash'le
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password);

            // Kullanıcı oluştur
            var user = new User
            {
                Name = createUserDto.Name,
                Email = createUserDto.Email,
                PasswordHash = passwordHash,
                ProfileImagePath = profileImagePath
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                ProfileImagePath = user.ProfileImagePath
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
        }

        // PUT: api/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromForm] UpdateUserDto updateUserDto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            // Email değişiyorsa kontrol et
            if (!string.IsNullOrEmpty(updateUserDto.Email) && updateUserDto.Email != user.Email)
            {
                if (await _context.Users.AnyAsync(u => u.Email == updateUserDto.Email))
                {
                    return BadRequest("Bu email adresi zaten kullanılıyor.");
                }
                user.Email = updateUserDto.Email;
            }

            // Name güncelle
            if (!string.IsNullOrEmpty(updateUserDto.Name))
            {
                user.Name = updateUserDto.Name;
            }

            // Password güncelle
            if (!string.IsNullOrEmpty(updateUserDto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Password);
            }

            // Profil resmi güncelle
            if (updateUserDto.ProfileImage != null)
            {
                try
                {
                    // Eski resmi sil
                    _fileService.DeleteProfileImage(user.ProfileImagePath);
                    
                    // Yeni resmi kaydet
                    user.ProfileImagePath = await _fileService.SaveProfileImageAsync(updateUserDto.ProfileImage);
                }
                catch (ArgumentException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            await _context.SaveChangesAsync();

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                ProfileImagePath = user.ProfileImagePath
            };

            return Ok(userDto);
        }

        // DELETE: api/users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Profil resmini sil
            _fileService.DeleteProfileImage(user.ProfileImagePath);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}