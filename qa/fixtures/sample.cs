using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Cinder;

/// <summary>A queue with a bounded capacity.</summary>
[Obsolete("Syntax fixture only")]
public sealed class Queue<T> where T : notnull
{
    private readonly List<T> _items = new();
    public const int Limit = 32;
    public int Count => _items.Count;
    public event Action<T>? Added;

    public async Task<bool> PushAsync(T value)
    {
        // TODO: persist the item.
        await Task.Yield();
        if (Count >= Limit) return false;
        _items.Add(value);
        Added?.Invoke(value);
        Console.WriteLine($"Count: {Count:D2}\n");
        return value is not null;
    }
}

public record Entry(string Name, int Score);
public enum Status { Ready, Full }
