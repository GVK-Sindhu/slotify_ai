using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace SlotifyAi.WebApi.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred in the request pipeline.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = HttpStatusCode.InternalServerError; // 500 if unexpected
        var message = "An error occurred while processing your request.";

        if (exception is ArgumentException || exception is InvalidOperationException)
        {
            code = HttpStatusCode.BadRequest; // 400
            message = exception.Message;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;

        var result = JsonSerializer.Serialize(new
        {
            error = message,
            statusCode = (int)code
        });

        return context.Response.WriteAsync(result);
    }
}
