import type { ImgHTMLAttributes } from "react";
import orderListIcon from "@/assets/order-list-icon.png";

export const OilDrumIcon = ({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => (
  <svg
    viewBox="0 0 1024 1024"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <image href={orderListIcon} width="1024" height="1024" preserveAspectRatio="xMidYMid meet" />
  </svg>
);

export default OilDrumIcon;