import { MatchedPartner, CollaborationProfile } from '../types/profile';

export interface CalendarEventPayload {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  organizerName: string;
  organizerEmail?: string;
  attendeeName: string;
  attendeePhone?: string;
}

/**
 * Format date to iCalendar UTC string format: YYYYMMDDTHHmmssZ
 */
export function formatToIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generate direct Google Calendar URL
 */
export function generateGoogleCalendarUrl(payload: CalendarEventPayload): string {
  const startIso = formatToIcsDate(payload.startTime);
  const endIso = formatToIcsDate(payload.endTime);
  const details = encodeURIComponent(payload.description);
  const title = encodeURIComponent(payload.title);
  const location = encodeURIComponent(payload.location);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

/**
 * Generate standard .ics (iCalendar) file string conforming to RFC 5545
 */
export function generateIcsContent(payload: CalendarEventPayload): string {
  const now = formatToIcsDate(new Date());
  const start = formatToIcsDate(payload.startTime);
  const end = formatToIcsDate(payload.endTime);
  const uid = `synapsematch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@synapsematch.ai`;

  // Escape special chars for ICS format
  const cleanSummary = payload.title.replace(/\n/g, ' ');
  const cleanDescription = payload.description.replace(/\n/g, '\\n');
  const cleanLocation = payload.location.replace(/\n/g, ' ');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SparkChat//Business Phone Chat Matching//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Spark Chat 灵感通话提醒',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers instant browser download of the .ics file
 */
export function downloadIcsFile(payload: CalendarEventPayload, filename: string = 'SparkChat-PhoneChat.ics') {
  const icsContent = generateIcsContent(payload);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper to build meeting payload from matched partner & selected datetime
 */
export function buildPhoneChatCalendarPayload(
  userProfile: CollaborationProfile,
  partner: MatchedPartner,
  dateTime: Date,
  durationMinutes: number = 30
): CalendarEventPayload {
  const endTime = new Date(dateTime.getTime() + durationMinutes * 60 * 1000);

  const theyOffer = partner.whyMatch?.theyOfferWhatYouSeek?.[0] || '核心业务与产业资源';
  const youOffer = partner.whyMatch?.youOfferWhatTheySeek?.[0] || '商业渠道与数字化能力';
  const scenario = partner.whyMatch?.suggestedScenarios?.[0] || partner.matchReason || '商业合作场景落地探讨';

  const description = `【Spark Chat 商业灵感通话】
双方：${userProfile?.name || '我'} (${userProfile?.company || '商业合伙人'} · ${userProfile?.title || '负责人'}) 
与 ${partner.name || '合伙人'} (${partner.company || '合作机构'} · ${partner.title || '负责人'})

【合作契合度】: ${partner.matchScore || 95}%
【核心互补价值】:
- ${partner.name || '对方'} 能提供: ${theyOffer}
- ${userProfile?.name || '我'} 寻求提供: ${youOffer}

【建议会谈议程 (30分钟)】:
1. 00-05m: 相互问候与背景简短互通
2. 05-20m: 聚焦合作场景落地讨论：${scenario}
3. 20-30m: 约定下一步行动方案与联系方式对接

电话拨打号: ${partner.phone || '微信语音 / 电话会议'}
由 Spark Chat 商业合作去中心化撮合平台自动同步。`;

  return {
    title: `商业合作 Phone Chat: ${userProfile?.name || '我'} & ${partner.name || '合伙人'}`,
    description,
    location: `电话连线 (${partner.phone || '微信电话'})`,
    startTime: dateTime,
    endTime,
    organizerName: userProfile?.name || '发起人',
    attendeeName: partner.name || '参会人',
    attendeePhone: partner.phone
  };
}
