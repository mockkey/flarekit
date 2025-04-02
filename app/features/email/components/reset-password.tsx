import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section,
} from '@react-email/components';

interface ResetPasswordEmailProps {
  username?: string;
  resetUrl?: string;
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
  marginTop: '15px',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
  margin: '20px auto',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  marginTop: '24px',
};

export default function ResetPasswordEmail({
  username = 'there',
  resetUrl = 'https://example.com/reset',
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            Reset your password
          </Heading>
          <Text style={paragraph}>
            Hey {username},
          </Text>
          <Text style={paragraph}>
            We received a request to reset your password. Click the button below to choose a new one:
          </Text>
          <Section style={{ textAlign: 'center', marginTop: '32px' }}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          <Text style={paragraph}>
            If you didn't request a password reset, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            This password reset link will expire in 1 hour for security reasons.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
