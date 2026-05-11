import HomeSvg from "@shared/assets/svg/home.svg?react";
import ProfileSvg from "@shared/assets/svg/profile.svg?react";
import LoginSvg from "@shared/assets/svg/login.svg?react";

type IconProps = { className?: string };

export function IconHome({ className }: IconProps) {
	return <HomeSvg className={className} aria-hidden />;
}

export function IconProfile({ className }: IconProps) {
	return <ProfileSvg className={className} aria-hidden />;
}

export function IconAuth({ className }: IconProps) {
	return <LoginSvg className={className} aria-hidden />;
}
