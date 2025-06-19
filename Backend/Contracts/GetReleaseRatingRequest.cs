namespace Backend.Contracts;

public record GetReleaseRatingRequest(Guid ReleaseId, Guid UserId);