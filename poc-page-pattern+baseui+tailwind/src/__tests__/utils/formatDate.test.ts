/**
 * Format Date Utilities Tests
 * Tests for date and file size formatting functions
 */

import { formatDate, formatRelativeTime, formatFileSize } from '../../utils/formatDate';

describe('formatDate', () => {
  describe('Valid dates', () => {
    it('should format ISO date string correctly', () => {
      const isoString = '2024-11-22T10:30:00.000Z';
      const result = formatDate(isoString);
      
      // Result should contain date components
      expect(result).toMatch(/Nov/);
      expect(result).toMatch(/22/);
      expect(result).toMatch(/2024/);
    });

    it('should format date with time', () => {
      const isoString = '2024-11-22T14:45:30.000Z';
      const result = formatDate(isoString);
      
      // Should include time
      expect(result).toContain(':');
    });

    it('should handle different months', () => {
      const dates = [
        '2024-01-15T12:00:00.000Z',
        '2024-06-15T12:00:00.000Z',
        '2024-12-15T12:00:00.000Z',
      ];

      dates.forEach(date => {
        const result = formatDate(date);
        expect(result).not.toBe('Invalid date');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Invalid dates', () => {
    it('should return "Invalid date" for invalid ISO string', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid date');
    });

    it('should return "Invalid date" for empty string', () => {
      const result = formatDate('');
      expect(result).toBe('Invalid date');
    });

    it('should return "Invalid date" for malformed date', () => {
      const result = formatDate('2024-13-45T99:99:99.000Z');
      expect(result).toBe('Invalid date');
    });
  });

  describe('Edge cases', () => {
    it('should handle year boundaries', () => {
      const result1 = formatDate('2023-12-31T23:59:59.000Z');
      const result2 = formatDate('2024-01-01T00:00:00.000Z');
      
      expect(result1).not.toBe('Invalid date');
      expect(result2).not.toBe('Invalid date');
    });

    it('should handle leap year dates', () => {
      const result = formatDate('2024-02-29T12:00:00.000Z');
      expect(result).not.toBe('Invalid date');
      expect(result).toMatch(/Feb/);
      expect(result).toMatch(/29/);
    });
  });
});

describe('formatRelativeTime', () => {
  // Helper to create date strings relative to now
  const getDateString = (secondsAgo: number): string => {
    const date = new Date(Date.now() - secondsAgo * 1000);
    return date.toISOString();
  };

  describe('Recent times', () => {
    it('should return "Just now" for times less than 60 seconds ago', () => {
      const result1 = formatRelativeTime(getDateString(0));
      const result2 = formatRelativeTime(getDateString(30));
      const result3 = formatRelativeTime(getDateString(59));

      expect(result1).toBe('Just now');
      expect(result2).toBe('Just now');
      expect(result3).toBe('Just now');
    });

    it('should return minutes ago for times less than 60 minutes', () => {
      const result1 = formatRelativeTime(getDateString(60)); // 1 minute
      const result2 = formatRelativeTime(getDateString(120)); // 2 minutes
      const result3 = formatRelativeTime(getDateString(3540)); // 59 minutes

      expect(result1).toBe('1 minute ago');
      expect(result2).toBe('2 minutes ago');
      expect(result3).toBe('59 minutes ago');
    });

    it('should use singular "minute" for 1 minute', () => {
      const result = formatRelativeTime(getDateString(60));
      expect(result).toBe('1 minute ago');
      expect(result).not.toContain('minutes');
    });
  });

  describe('Hours and days', () => {
    it('should return hours ago for times less than 24 hours', () => {
      const result1 = formatRelativeTime(getDateString(3600)); // 1 hour
      const result2 = formatRelativeTime(getDateString(7200)); // 2 hours
      const result3 = formatRelativeTime(getDateString(82800)); // 23 hours

      expect(result1).toBe('1 hour ago');
      expect(result2).toBe('2 hours ago');
      expect(result3).toBe('23 hours ago');
    });

    it('should use singular "hour" for 1 hour', () => {
      const result = formatRelativeTime(getDateString(3600));
      expect(result).toBe('1 hour ago');
      expect(result).not.toContain('hours');
    });

    it('should return days ago for times less than 30 days', () => {
      const result1 = formatRelativeTime(getDateString(86400)); // 1 day
      const result2 = formatRelativeTime(getDateString(172800)); // 2 days
      const result3 = formatRelativeTime(getDateString(2505600)); // 29 days

      expect(result1).toBe('1 day ago');
      expect(result2).toBe('2 days ago');
      expect(result3).toBe('29 days ago');
    });

    it('should use singular "day" for 1 day', () => {
      const result = formatRelativeTime(getDateString(86400));
      expect(result).toBe('1 day ago');
      expect(result).not.toContain('days');
    });
  });

  describe('Old dates', () => {
    it('should return formatted date for times older than 30 days', () => {
      const oldDate = getDateString(2592000); // 30 days
      const result = formatRelativeTime(oldDate);
      
      // Should use full date format, not relative time
      expect(result).not.toContain('ago');
      expect(result.length).toBeGreaterThan(10); // Full date is longer
    });

    it('should format very old dates', () => {
      const veryOldDate = '2020-01-01T00:00:00.000Z';
      const result = formatRelativeTime(veryOldDate);
      
      // Should use full date format for old dates (may show as 2019 due to timezone)
      expect(result).toMatch(/(2019|2020)/);
      expect(result).toMatch(/(Jan|Dec)/);
    });
  });
});

describe('formatFileSize', () => {
  describe('Valid sizes', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('Unknown');
      expect(formatFileSize(1)).toBe('1 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(10240)).toBe('10 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB'); // 1024^2
      expect(formatFileSize(2097152)).toBe('2 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB'); // 1024^3
      expect(formatFileSize(2147483648)).toBe('2 GB');
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });

    it('should format terabytes', () => {
      expect(formatFileSize(1099511627776)).toBe('1 TB'); // 1024^4
      expect(formatFileSize(2199023255552)).toBe('2 TB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1843)).toBe('1.8 KB'); // 1843/1024 = 1.799...
      expect(formatFileSize(1587)).toBe('1.55 KB'); // 1587/1024 = 1.5498...
    });
  });

  describe('Edge cases', () => {
    it('should handle null', () => {
      expect(formatFileSize(null)).toBe('Unknown');
    });

    it('should handle undefined', () => {
      expect(formatFileSize(undefined)).toBe('Unknown');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('Unknown');
    });

    it('should handle very large sizes', () => {
      const result = formatFileSize(1099511627776 * 10); // 10 TB
      expect(result).toContain('TB');
      expect(result).not.toBe('Unknown');
    });

    it('should handle decimal inputs', () => {
      expect(formatFileSize(1024.5)).toBe('1 KB');
      expect(formatFileSize(2048.9)).toBe('2 KB');
    });
  });

  describe('Real world examples', () => {
    it('should format typical file sizes', () => {
      // Empty file
      expect(formatFileSize(0)).toBe('Unknown');
      
      // Small text file
      expect(formatFileSize(5120)).toBe('5 KB');
      
      // Document
      expect(formatFileSize(524288)).toBe('512 KB');
      
      // Image
      expect(formatFileSize(2097152)).toBe('2 MB');
      
      // Video
      expect(formatFileSize(104857600)).toBe('100 MB');
      
      // Large file
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });
  });
});
