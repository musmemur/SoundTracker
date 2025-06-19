using Backend.Contracts;
using Backend.Entities;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("[controller]")]
public class ReleaseRatingController(AppDbContext dbContext, UserService userService) : ControllerBase
{
    [HttpPost("rate")]
    [Authorize]
    public async Task<IActionResult> RateRelease([FromBody] ReleaseRatingRequest request, CancellationToken ct)
    {
        var release = await dbContext.Releases
            .Where(u => u.Id == request.ReleaseId)
            .AsNoTracking()
            .FirstOrDefaultAsync(ct);
    
        var userId = userService.GetUserId();
        if (userId == null)
            return Unauthorized(new { message = "Пользователь не авторизован" });

        var existing = await dbContext.ReleaseRatings
            .FirstOrDefaultAsync(r => r.UserId == userId && release != null && r.ReleaseId == release.Id, ct);
    
        if (existing != null)
        {
            existing.Rating = request.Rating;
            dbContext.ReleaseRatings.Update(existing);
        }
        else
        {
            if (release != null)
            {
                var rating = new ReleaseRating(userId.Value, release.Id, request.Rating);
                dbContext.ReleaseRatings.Add(rating);
            }
        }
    
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "Оценка сохранена или обновлена." });
    }

    [HttpPost("delete")]
    [Authorize]
    public async Task<IActionResult> DeleteRating([FromBody] DeleteReleaseRatingRequest request, CancellationToken ct)
    {
        var release = await dbContext.Releases
            .Where(u => u.Id == request.ReleaseId)
            .AsNoTracking()
            .FirstOrDefaultAsync(ct);
    
        var userId = userService.GetUserId();
        if (userId == null)
            return Unauthorized(new { message = "Пользователь не авторизован" });

        var rating = await dbContext.ReleaseRatings
            .FirstOrDefaultAsync(r => r.UserId == userId && release != null && r.ReleaseId == release.Id, ct);
        
        if (rating == null)
            return NotFound(new { message = "Оценка не найдена." });

        dbContext.ReleaseRatings.Remove(rating);
        await dbContext.SaveChangesAsync(ct);

        return Ok(new { message = "Оценка удалена." });
    }

    [HttpPost("get")]
    public async Task<IActionResult> GetUserRating([FromBody]GetReleaseRatingRequest request, CancellationToken ct)
    {
        var release = await dbContext.Releases
            .Where(u => u.Id == request.ReleaseId)
            .AsNoTracking()
            .FirstOrDefaultAsync(ct);
    
        if (release == null)
        {
            return NotFound("Release not found");
        }

        var rating = await dbContext.ReleaseRatings
            .FirstOrDefaultAsync(r => r.UserId == request.UserId && r.ReleaseId == release.Id, ct);
    
        return rating == null ? Ok(null) : Ok(new { rating.Rating });
    }
}
