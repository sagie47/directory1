## Design Context

### Users
Homeowners and property managers in the Okanagan Valley seeking reliable trades and contractors, as well as trade businesses looking to manage their directory presence and capture leads. Their context is often stress or urgency (needing a fix) or high-stakes planning (renovations). The job to be done is finding a verified, trustworthy professional quickly and easily.

### Brand Personality
**Rugged, sleek, modern.**
The interface must evoke feelings of **trust, relief, and safety**. It should feel like a premium, durable tool—much like high-end outdoor equipment (e.g., YETI). It is professional and utilitarian without feeling cheap or generic.

### Aesthetic Direction
A refined blend of premium elegance and subtle brutalism.
- **Visual Tone:** High contrast, strong typography, structured grids, and solid borders. It avoids the harshness of pure brutalism by incorporating rounded corners (`rounded-2xl`, `rounded-full`), smooth transitions (`duration-500`, `ease-[0.16,1,0.3,1]`), and refined hover effects (soft floating shadows rather than hard, solid offsets).
- **Colors:** Predominantly grayscale (`zinc-50`, `white`, `zinc-900`) accented with vibrant utility colors like `orange-500` for primary actions.
- **Theme:** Currently built as a high-contrast light mode with dark accents, with architectural consideration for a full Dark Mode implementation later.

### Design Principles
1. **Rugged Elegance:** Combine the durability of structural borders and bold uppercase typography with the polish of smooth animations and soft, diffused shadows.
2. **Inspire Confidence:** Use structured layouts, clear typography (`font-medium` to `font-black`), and a utilitarian aesthetic to project reliability, safety, and trust. 
3. **Utility First:** Prioritize clear calls to action, highly legible content, and straightforward navigation. The interface is a tool to solve a problem.
4. **Subtle Brutalism:** Use structural elements (like `SectionEyebrow`, visible borders, and grid background overlays) to create an "operational" feel, but soften them with refined interactions to keep it premium.
5. **Future-Proof Contrast:** Build with high contrast and semantic color scales (like Tailwind's `zinc` and `orange`) to ensure an easy transition to a full Dark Mode in the future.
