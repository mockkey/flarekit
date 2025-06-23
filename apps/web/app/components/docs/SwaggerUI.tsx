import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

interface SwaggerUIProps {
  url: string;
}

export function SwaggerUIComponent({ url }: SwaggerUIProps) {
  return <SwaggerUI url={url} />;
}
