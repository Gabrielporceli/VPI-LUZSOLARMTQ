import { FlickeringGrid } from "./flickering-grid-hero";
import logo from "../../assets/logo-white.png";

const maskStyle = {
  WebkitMaskImage: `url('${logo}')`,
  WebkitMaskSize: 'contain',
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  maskImage: `url('${logo}')`,
  maskSize: 'contain',
  maskPosition: 'center',
  maskRepeat: 'no-repeat',
};

const GRID_CONFIG = {
  background: {
    color: "#6829c0",
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
};

const FlickeringGridDemo = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {/* Background grid — subtle, full coverage */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <FlickeringGrid {...GRID_CONFIG.background} />
      </div>

      {/* Logo mask grid — brighter, centered on top */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          ...maskStyle,
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        <FlickeringGrid {...GRID_CONFIG.logo} />
      </div>
    </div>
  );
};

export { FlickeringGridDemo };
