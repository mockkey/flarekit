export function formatUserAgent(userAgent: string): string {
  const browserMatch = userAgent.match(/(Chrome|Safari|Firefox|Edge|MSIE)\/[\d.]+/);
  const osMatch = userAgent.match(/\((.*?)\)/);
  let browser = '';
  let os = '';
  if (browserMatch) {
    browser = browserMatch[1];
  }

  if (osMatch) {
    const osInfo = osMatch[1];
    if (osInfo.includes('iPhone')) {
      os = 'iPhone';
    } else if (osInfo.includes('Windows')) {
      os = 'Windows';
    } else if (osInfo.includes('Mac OS X')) {
      os = 'Mac';
    } else if (osInfo.includes('Linux')) {
      os = 'Linux';
    } else if (osInfo.includes('Android')) {
      os = 'Android';
    }
  }

  return `${browser} on ${os}`
}

