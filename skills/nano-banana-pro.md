# Skill: Nano Banana Pro — Gemini Image Generation

## Model Reference

| Model | ID | Best For |
|-------|----|----------|
| Nano Banana Pro | `gemini-3-pro-image-preview` | Professional assets, precise text, complex scenes |
| Nano Banana 2 | `gemini-3.1-flash-image-preview` | Fast iteration, high volume, good quality |
| Nano Banana | `gemini-2.5-flash-image` | Speed-first, simple generations |

**Use Pro for final assets. Use Flash for drafts/iteration.**

## API Setup (Python)

```python
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_KEY")

response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents="Your prompt here",
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(
            aspect_ratio="16:9",   # See aspect ratios below
            image_size="2K"        # "512px", "1K", "2K", "4K"
        ),
    )
)

for part in response.parts:
    if part.text is not None:
        print(part.text)
    elif image := part.as_image():
        image.save("output.png")
```

### Aspect Ratios
`1:1` | `2:3` | `3:2` | `3:4` | `4:3` | `4:5` | `5:4` | `9:16` | `16:9` | `21:9` | `1:4` | `4:1` | `1:8` | `8:1`

### Image Editing (input image + text)

```python
from PIL import Image

response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=[
        "Change the background to a marble desk with soft natural lighting",
        Image.open("input.png")
    ],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE']
    )
)
```

### Reference Images (up to 14)

```python
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=[
        Image.open("style_ref.png"),
        Image.open("layout_ref.png"),
        "Generate a product mockup in this style with this layout, showing an invoice template on an iPad"
    ],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE']
    )
)
```

## Prompt Formula

```
[Subject/Action] + [Style/Medium] + [Setting/Atmosphere] + [Technical Specs] + [Mood/Emotion]
```

**Write descriptive narrative paragraphs, NOT keyword lists.**

### BAD (keyword spam):
> invoice template, iPad mockup, marble desk, 4k, professional, trending, masterpiece

### GOOD (narrative):
> A professional product photograph of an iPad Pro displaying an invoice template with navy blue headers, resting on a white marble desk. Soft natural window light from the left creates gentle shadows. A small succulent plant and gold pen sit nearby. Shot from a 30-degree overhead angle with shallow depth of field, 50mm lens equivalent. Clean, minimal, modern business aesthetic.

## 5 Prompt Components (Google DeepMind Official)

1. **Style**: Photo, illustration, watercolor, vector, 3D render, etc.
2. **Subject**: Who/what appears — appearance, clothing, positioning
3. **Setting**: Location, environment, background
4. **Action**: What's happening — movement, interactions, activities
5. **Composition**: Framing, camera angle, shot distance, orientation

## Text in Images

Nano Banana Pro has the best text rendering of any image model. Rules:

- Wrap exact text in **quotation marks**: `"INVOICE"`
- Specify font style: `"bold sans-serif"`, `"elegant serif"`
- Specify placement: `"centered at top"`, `"bottom-right corner"`
- Limit to **1-3 text elements** per image for reliability
- Prefer **sans-serif** fonts for best results

Example:
> A clean white business card design with the text "TEELIGHTFULL TEES" in bold navy sans-serif font centered at top, and "Digital Templates" in smaller grey text below.

## Product Mockup Prompts — Best Practices

### Device Mockups
> A professional product photograph of a [device] displaying [your content], placed on [surface]. [Lighting description]. [Nearby props]. Shot from [angle] with [lens/depth]. [Overall mood].

### Flat Lay / Overview
> An elegant flat lay arrangement on [surface] showing [items spread out]. Overhead shot, soft even lighting, no harsh shadows. [Color palette]. Clean editorial style.

### Lifestyle Context
> [Person type] using [device] showing [your product] in [setting]. Natural, candid feel. [Lighting]. Shot from [angle]. Warm, inviting, professional atmosphere.

## Photography Technical Terms (use these)

**Angles**: overhead, 30-degree angle, eye-level, 3/4 angle, worm's eye view
**Lenses**: 50mm, 85mm f/2.8, wide-angle, macro
**Lighting**: soft natural window light, studio three-point lighting, golden hour, rim lighting, diffused overhead
**Depth**: shallow depth of field, bokeh background, sharp focus on subject
**Surface**: white marble, light oak desk, concrete, linen fabric, dark slate

## Iterative Editing (Key Advantage)

Don't start over — refine what you have in multi-turn conversation:

1. Generate initial image
2. "Move the iPad slightly to the left and add a coffee cup"
3. "Make the lighting warmer and more golden"
4. "Change the background to a darker wood surface"

Each edit preserves what already works.

## Common Pitfalls

| Mistake | Fix |
|---------|-----|
| Vague prompts ("make a nice mockup") | Be specific about every element |
| Keyword spam ("4k masterpiece trending") | Write natural descriptive sentences |
| Conflicting styles ("photorealistic cartoon") | Pick one style, be consistent |
| Prompts over 500 words | Keep it focused, 50-150 words ideal |
| Requesting specific brand logos | Describe the design instead, or use reference images |
| Ignoring composition | Always specify angle and framing |

## Etsy Listing Mockup Recipes

### Hero Image (Main Listing Photo)
> A professional product photograph of an iPad Pro on a white marble desk displaying an invoice template with [color] headers and auto-calculating totals. Soft natural light from a large window on the left. A small green succulent, gold pen, and reading glasses sit artfully nearby. Shot from a 30-degree overhead angle, 50mm lens, shallow depth of field with soft bokeh. Clean, modern, premium business aesthetic. The screen clearly shows a professional invoice layout.

### All Color Variants
> An elegant flat lay arrangement on a light oak desk showing four printed invoice templates side by side, each with a different color header: navy blue, forest green, terracotta orange, and charcoal grey. Overhead shot, soft diffused lighting, no harsh shadows. Small decorative elements (paper clips, a pen) scattered naturally. Clean editorial product photography style.

### Format Options Graphic
> A clean, modern infographic on a white background showing four format icons arranged in a row: a red PDF icon, a blue Word document icon, a green Excel spreadsheet icon, and a green Google Sheets icon. Below each icon, the text labels "PDF", "Word", "Excel", "Google Sheets" in clean sans-serif font. The header text reads "4 Formats Included" in bold navy. Minimal, professional graphic design style.

### How It Works
> A clean three-step infographic on a white background. Step 1 shows a download arrow icon with the text "Download". Step 2 shows a pencil/form icon with the text "Fill In". Step 3 shows a send/email icon with the text "Send". The steps are connected by arrows. Navy blue and white color scheme, bold modern sans-serif typography. Clean, minimal instruction graphic style.

## Reference Image Strategy (for brand consistency)

When generating multiple images for the same listing:

- **Slots 1-2**: Primary style direction (your best generated image so far)
- **Slot 3**: Layout/composition reference
- **Slots 4+**: Color palette, brand elements

This keeps all your listing images visually consistent.
