# Photos are resized with algorithmic resampling, not AI upscaling

Every photo captured with a Listing is normalized to a fixed 16:9 frame via `sharp` — cropping larger images down, and enlarging smaller ones using standard high-quality resampling (Lanczos3).

"Upscale" was explicitly requested for undersized source photos. True AI upscaling (a super-resolution model) was considered but not built, because no upscaling API is connected in this environment — building it would mean picking and paying for an external service just for this. Algorithmic resampling was chosen instead as the thing actually available, not as the ideal outcome.

This is a placeholder decision, not a permanent one: real AI upscaling is a reasonable thing to add later if an API key for a service like Replicate gets connected.
