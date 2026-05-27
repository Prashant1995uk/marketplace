import { catchAsync } from '../utils/catchAsync.js';

/**
 * Placeholder for ad network (e.g. Google AdSense) config or slot IDs.
 */
export const getAdPlaceholder = catchAsync(async (req, res) => {
  res.json({
    success: true,
    message: 'Replace with your ad client/slot configuration.',
    placeholder: {
      enabled: false,
      provider: 'none',
      slotId: null,
    },
  });
});
