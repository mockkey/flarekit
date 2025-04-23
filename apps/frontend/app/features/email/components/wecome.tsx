import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  username?: string;
  verifyUrl?: string;
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
  marginTop: "15px",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
  margin: "20px auto",
};

const footer = {
  color: "#898989",
  fontSize: "12px",
  marginTop: "24px",
};

interface WaitlistEmailProps {
  name: string;
}

export default function WelcomeEmail({
  username = "there",
  verifyUrl = "https://example.com/verify",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Verify your email address</Heading>
          <Text style={paragraph}>Hey {username},</Text>
          <Text style={paragraph}>
            Thanks for registering! To get started, please verify your email
            address by clicking the button below.
          </Text>
          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Button style={button} href={verifyUrl}>
              Verify Email
            </Button>
          </Section>
          <Text style={paragraph}>
            If you didn't create this account, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            This link will expire in 24 hours. If you need a new verification
            link, please try signing in again.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
