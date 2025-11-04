'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface ChartProps {
  data: { name: string; value: number }[];
}

export default function Chart({ data }: ChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    // Watch for changes to the dark class
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Dynamic colors based on theme
  const chartColors = {
    gridStroke: isDark ? '#374151' : '#E5E7EB',
    axisStroke: isDark ? '#6B7280' : '#9CA3AF',
    axisTick: isDark ? '#6B7280' : '#9CA3AF',
    tooltipBg: isDark ? '#1F2937' : '#FFFFFF',
    tooltipBorder: isDark ? '#374151' : '#E5E7EB',
    tooltipText: isDark ? '#F9FAFB' : '#111827',
    lineStroke: '#3B82F6',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Overview</h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridStroke} />
            <XAxis dataKey="name" stroke={chartColors.axisStroke} fontSize={12} tick={{ fill: chartColors.axisTick }} />
            <YAxis stroke={chartColors.axisStroke} fontSize={12} tick={{ fill: chartColors.axisTick }} />
            <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: '8px', color: chartColors.tooltipText }} />
            <Line type="monotone" dataKey="value" stroke={chartColors.lineStroke} strokeWidth={2} dot={{ fill: chartColors.lineStroke, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}