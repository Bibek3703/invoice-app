import { G, Path, Svg } from "@react-pdf/renderer";

export const Logo = () => <Svg
    style={{ width: 24, height: 24, }}
>
    <Path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" stroke="oklab(100% 0 -0.00011)" />
    <Path d="M14 2v4a2 2 0 0 0 2 2h4" stroke="oklab(100% 0 -0.00011)" />
    <Path d="M10 9H8" stroke="oklab(100% 0 -0.00011)" />
    <Path d="M16 13H8" stroke="oklab(100% 0 -0.00011)" />
    <Path d="M16 17H8" stroke="oklab(100% 0 -0.00011)" />
</Svg>