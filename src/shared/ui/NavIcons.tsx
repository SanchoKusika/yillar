import HomeSvg from "@shared/assets/svg/home.svg";
import ProfileSvg from "@shared/assets/svg/profile.svg";
import LoginSvg from "@shared/assets/svg/login.svg";

type IconProps = { size?: number; color?: string };

export function IconHome({ size = 24, color = "#F5EFE0" }: IconProps) {
  return <HomeSvg width={size} height={size} color={color} />;
}

export function IconProfile({ size = 24, color = "#F5EFE0" }: IconProps) {
  return <ProfileSvg width={size} height={size} color={color} />;
}

export function IconAuth({ size = 24, color = "#F5EFE0" }: IconProps) {
  return <LoginSvg width={size} height={size} color={color} />;
}
