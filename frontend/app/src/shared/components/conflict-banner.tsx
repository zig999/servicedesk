import type { JSX } from "react";
import { Banner } from "@tui/ui/banner";

export type ConflictBannerProps = {
  title: string;
  message: string;
};

export function ConflictBanner({ title, message }: ConflictBannerProps): JSX.Element {
  return <Banner title={title} subtitle={message} />;
}
