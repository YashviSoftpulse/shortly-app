// import { Card, EmptyState, Page } from "@shopify/polaris";
// import { notFoundImage } from "../assets";

import { Button, ButtonGroup, Card, Text } from "@shopify/polaris";
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Card>
     <h1>404 - Not Found</h1>
    </Card>
  );
}
