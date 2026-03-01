# General improvements
- Canvas renderer handles tens of thousands of markers with low overhead
- Request throughput is maximized via a semaphore - 75 requests are always in flight, by default
- **Direct sampling** - ~30x faster than default, ~3x faster than blue line sampling

# Sampling methods

The three generation methods:

1. **Default** — pick a random point inside the polygon, query the API. Low throughput in sparsely covered regions, and inefficient in general.
2. **Blue line rejection sampling** — pick a random point, check if it overlaps a coverage tile pixel (local check), only query the API if it does. Filters out empty areas but still wastes time generating and discarding points.
3. **Blue line direct sampling** — pre-scan all coverage tiles for the polygon bounds, build a flat array of every blue pixel coordinate, then sample directly from that array. Every generated point is guaranteed to be on a coverage line.

# Benchmarks

By nature of random sampling, benchmarks are non-deterministic and you may experience different results. locs/min is entirely dependent on hardware and bandwidth.

## Poland

| Method                            | locs/min  | hit % |
| --------------------------------- | --------- | ----- |
| Default (random point-in-polygon) | ~3500     | 56%   |
| Blue line (rejection sampling)    | ~3800     | 74%   |
| **Blue line (direct sampling)**   | **~4650** | **97%** |

## Uganda

| Method                            | locs/min  | hit % |
| --------------------------------- | --------- | ----- |
| Default (random point-in-polygon) | ~40       | <1%   |
| Blue line (rejection sampling)    | ~1100     | 33%   |
| **Blue line (direct sampling)**   | **~4300** | **55%** |

## Brazil

| Method                            | locs/min  | hit % |
| --------------------------------- | --------- | ----- |
| Default (random point-in-polygon) | ~700      | 8%    |
| Blue line (rejection sampling)    | ~2200     | 32%   |
| **Blue line (direct sampling)**   | **~2900** | **39%** |

## Buryatia

| Method                            | locs/min  | hit % |
| --------------------------------- | --------- | ----- |
| Default (random point-in-polygon) | ~200      | 2%    |
| Blue line (rejection sampling)    | ~750      | 40%   |
| **Blue line (direct sampling)**   | **~5300** | **83%** |

# Limitations

- Not a uniform distribution. Direct sampling is biased toward areas with more blue line pixels at the tile zoom level, which correlates with road density. Sparser roads get proportionally fewer samples.
- Hit rate < 100% even with direct sampling because tile pixels represent approximate coverage at a fixed zoom level; the actual API panorama search radius may not find a panorama at the exact sampled coordinate.
