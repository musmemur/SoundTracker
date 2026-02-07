using System.Text.Json;
using Backend.API.ApiEntities.AlbumApiResponse;

namespace Backend.API;

public static class ApiClient
{
    private static readonly HttpClient HttpClient = new();

    public static async Task<AlbumApiResponse?> GetAlbumsAsync(string albumTitle, int page, CancellationToken cancellationToken)
    {
        var requestUrl =
            $"https://ws.audioscrobbler.com/2.0/?method=album.search&album={Uri.EscapeDataString(albumTitle)}&api_key=eec9f36487afa21d194dd8421f4d5390&format=json&page={page}";

        var result = await HttpClient.GetFromJsonAsync<AlbumApiResponse>(requestUrl,
            new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            }, cancellationToken: cancellationToken);

        return result;
    }
}