import { FlickeringGrid } from "./flickering-grid-hero";
import logo from "../../assets/logo.png";

const maskStyle = {
  WebkitMaskImage: `url('${logo}')`,
  WebkitMaskSize: '50%',
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  maskImage: `url('${logo}')`,
  maskSize: '50%',
  maskPosition: 'center',
  maskRepeat: 'no-repeat',
} as const;

// 定义网格动画颜色和配置
const GRID_CONFIG = {
  background: {
    color: "#6829c0", // Adapted to match Growth Hub brand color
    maxOpacity: 0.15,
    flickerChance: 0.12,
    squareSize: 4,
    gridGap: 4,
  },
  logo: {
    color: "#6829c0",
    maxOpacity: 0.65,
    flickerChance: 0.18,
    squareSize: 3,
    gridGap: 6,
  },
} as const;

const FlickeringGridDemo = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background grid — subtle, full coverage */}
      <div className="absolute inset-0 z-0">
        <FlickeringGrid {...GRID_CONFIG.background} />
      </div>

      {/* Logo mask grid — brighter, on top of background */}
      <div
        className="absolute inset-0 z-10"
        style={{
          ...maskStyle,
          top: '76px',
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        <FlickeringGrid {...GRID_CONFIG.logo} />
      </div>
    </div>
  );
};

export { FlickeringGridDemo };
