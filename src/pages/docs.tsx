// eslint-disable-next-line import/no-unresolved
import "swagger-ui-react/swagger-ui.css";

import dynamic from "next/dynamic";

const SwaggerUI = dynamic(import("swagger-ui-react"), { ssr: false });

export default function Page(): JSX.Element {
  return <SwaggerUI url="/api/v1.0/openapi/openapi.json" />;
}
