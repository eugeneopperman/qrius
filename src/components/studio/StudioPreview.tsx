import { memo, useCallback } from 'react';
import { useStudioStore, type StudioPanel } from '@/stores/studioStore';
import { useShallow } from 'zustand/react/shallow';
import { useQRCodeInstance } from '@/hooks/useQRCodeInstance';
import { useGoogleFont, getFontFamily } from '@/hooks/useGoogleFont';
import {
  getFrameClasses,
  getFrameInlineStyles,
  TopLabel,
  BadgeLabel,
  BottomLabel,
  BannerLabel,
  RibbonLabel,
  SpeechBubblePointer,
  DecorativeCorners,
  MinimalLine,
} from '@/components/qr/QRFrame';
import { cn } from '@/utils/cn';

const PREVIEW_SIZE = 240;
const PREVIEW_DATA = 'https://qrius.app';

export const StudioPreview = memo(function StudioPreview() {
  const { style, activePanel, setActivePanel } = useStudioStore(
    useShallow((s) => ({
      style: s.style,
      activePanel: s.activePanel,
      setActivePanel: s.setActivePanel,
    }))
  );

  // Load Google Font if specified
  useGoogleFont(style.googleFontFamily, style.googleFontWeight);

  // QR code instance
  const { containerRef } = useQRCodeInstance({
    data: PREVIEW_DATA,
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    dotsType: style.dotsType || 'square',
    dotsColor: style.dotsColor || '#000000',
    cornersSquareType: style.cornersSquareType || 'square',
    cornersDotType: style.cornersDotType || 'square',
    backgroundColor: style.backgroundColor || '#ffffff',
    useGradient: style.useGradient,
    gradient: style.gradient,
    logoUrl: style.logoUrl,
    logoShape: style.logoShape,
    logoMargin: style.logoMargin,
    logoSize: style.logoSize,
    qrRoundness: style.qrRoundness,
    qrPattern: style.qrPattern,
  });

  const handleZoneClick = useCallback(
    (panel: StudioPanel) => {
      setActivePanel(panel);
    },
    [setActivePanel]
  );

  const frameStyle = style.frameStyle || 'none';
  const frameLabel = style.frameLabel || '';
  const hasFrame = frameStyle !== 'none';
  const hasLogo = !!style.logoUrl;
  const hasLabel =
    !!frameLabel &&
    [
      'bottom-label',
      'top-label',
      'badge',
      'speech-bubble',
      'ribbon',
      'sticker',
      'banner-bottom',
      'banner-top',
    ].includes(frameStyle);

  // Font styling for label
  const labelFontFamily = style.googleFontFamily
    ? getFontFamily(style.googleFontFamily)
    : getFontFamily(style.frameFontFamily);
  const fontSize = style.frameFontSize || 'base';
  const fontFamily = style.frameFontFamily || 'sans';

  const frameClasses = hasFrame ? getFrameClasses(frameStyle) : '';
  const frameInlineStyles = hasFrame
    ? getFrameInlineStyles(frameStyle, style)
    : {};

  // Custom border radius
  const borderRadius =
    hasFrame && style.frameBorderRadius
      ? `${style.frameBorderRadius}px`
      : undefined;
  const padding =
    hasFrame && style.framePadding !== undefined
      ? `${style.framePadding}px`
      : hasFrame
        ? '12px'
        : undefined;

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Background hit zone */}
      <button
        onClick={() => handleZoneClick('background')}
        className={cn(
          'absolute -inset-6 rounded-2xl transition-all cursor-pointer z-0',
          activePanel === 'background'
            ? 'ring-2 ring-orange-500 ring-offset-4 ring-offset-white dark:ring-offset-gray-900'
            : 'hover:ring-2 hover:ring-orange-300 hover:ring-dashed hover:ring-offset-4 hover:ring-offset-white dark:hover:ring-offset-gray-900'
        )}
        aria-label="Edit background"
        type="button"
      />

      {/* Frame container */}
      <div
        className={cn('relative z-10 transition-all', frameClasses)}
        style={{
          ...frameInlineStyles,
          borderRadius,
          padding,
          backgroundColor:
            frameStyle === 'sticker'
              ? style.frameBgColor || '#FEF3C7'
              : undefined,
        }}
      >
        {/* Frame hit zone */}
        {hasFrame && (
          <button
            onClick={() => handleZoneClick('frame')}
            className={cn(
              'absolute inset-0 z-20 rounded-[inherit] transition-all cursor-pointer',
              activePanel === 'frame'
                ? 'ring-2 ring-orange-500'
                : 'hover:ring-2 hover:ring-dashed hover:ring-orange-300'
            )}
            aria-label="Edit frame"
            type="button"
          />
        )}

        {/* Top decorative elements */}
        {frameStyle === 'decorative-corners' && (
          <DecorativeCorners color={style.frameBorderColor} />
        )}
        {frameStyle === 'minimal-line' && (
          <MinimalLine position="top" color={style.frameBorderColor} />
        )}

        {/* Banner Top Label */}
        {frameStyle === 'banner-top' && hasLabel && (
          <BannerLabel
            label={frameLabel}
            fontSize={fontSize}
            fontFamily={fontFamily}
            icon={style.frameIcon}
            iconPosition={style.frameIconPosition}
            bgColor={style.frameBgColor}
            position="top"
          />
        )}

        {/* Top Label */}
        {frameStyle === 'top-label' && hasLabel && (
          <TopLabel
            label={frameLabel}
            fontSize={fontSize}
            fontFamily={fontFamily}
            icon={style.frameIcon}
            iconPosition={style.frameIconPosition}
          />
        )}

        {/* Badge Label */}
        {frameStyle === 'badge' && hasLabel && (
          <BadgeLabel
            label={frameLabel}
            fontSize={fontSize}
            fontFamily={fontFamily}
            icon={style.frameIcon}
            iconPosition={style.frameIconPosition}
          />
        )}

        {/* QR Code area */}
        <div className="relative">
          {/* QR Body hit zone */}
          <button
            onClick={() => handleZoneClick('dots-colors')}
            className={cn(
              'absolute inset-0 z-30 rounded-lg transition-all cursor-pointer',
              activePanel === 'dots-colors'
                ? 'ring-2 ring-orange-500'
                : 'hover:ring-2 hover:ring-dashed hover:ring-orange-300'
            )}
            aria-label="Edit QR style and colors"
            type="button"
          />

          {/* Logo hit zone */}
          {hasLogo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoneClick('logo');
              }}
              className={cn(
                'absolute z-40 cursor-pointer transition-all',
                'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                activePanel === 'logo'
                  ? 'ring-2 ring-orange-500 rounded-lg'
                  : 'hover:ring-2 hover:ring-dashed hover:ring-orange-300 rounded-lg'
              )}
              style={{
                width: `${(style.logoSize || 0.3) * 100}%`,
                height: `${(style.logoSize || 0.3) * 100}%`,
              }}
              aria-label="Edit logo"
              type="button"
            />
          )}

          <div
            ref={containerRef}
            className="flex items-center justify-center"
            style={{
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
            }}
          />
        </div>

        {/* Bottom Label */}
        {frameStyle === 'bottom-label' && hasLabel && (
          <div className="relative">
            <button
              onClick={() => handleZoneClick('label')}
              className={cn(
                'absolute inset-0 z-30 transition-all cursor-pointer',
                activePanel === 'label'
                  ? 'border-b-2 border-orange-500'
                  : 'hover:border-b-2 hover:border-dashed hover:border-orange-300'
              )}
              aria-label="Edit label"
              type="button"
            />
            <BottomLabel
              label={frameLabel}
              fontSize={fontSize}
              fontFamily={fontFamily}
              icon={style.frameIcon}
              iconPosition={style.frameIconPosition}
            />
          </div>
        )}

        {/* Ribbon */}
        {frameStyle === 'ribbon' && hasLabel && (
          <div className="relative">
            <button
              onClick={() => handleZoneClick('label')}
              className={cn(
                'absolute inset-0 z-30 transition-all cursor-pointer',
                activePanel === 'label'
                  ? 'border-b-2 border-orange-500'
                  : 'hover:border-b-2 hover:border-dashed hover:border-orange-300'
              )}
              aria-label="Edit label"
              type="button"
            />
            <RibbonLabel
              label={frameLabel}
              fontSize={fontSize}
              fontFamily={fontFamily}
              icon={style.frameIcon}
              iconPosition={style.frameIconPosition}
              bgColor={style.frameBgColor}
            />
          </div>
        )}

        {/* Sticker label */}
        {frameStyle === 'sticker' && hasLabel && (
          <div className="relative">
            <button
              onClick={() => handleZoneClick('label')}
              className={cn(
                'absolute inset-0 z-30 transition-all cursor-pointer',
                activePanel === 'label'
                  ? 'border-b-2 border-orange-500'
                  : 'hover:border-b-2 hover:border-dashed hover:border-orange-300'
              )}
              aria-label="Edit label"
              type="button"
            />
            <BottomLabel
              label={frameLabel}
              fontSize={fontSize}
              fontFamily={fontFamily}
              icon={style.frameIcon}
              iconPosition={style.frameIconPosition}
            />
          </div>
        )}

        {/* Banner Bottom Label */}
        {frameStyle === 'banner-bottom' && hasLabel && (
          <div className="relative">
            <button
              onClick={() => handleZoneClick('label')}
              className={cn(
                'absolute inset-0 z-30 transition-all cursor-pointer',
                activePanel === 'label'
                  ? 'ring-2 ring-orange-500'
                  : 'hover:ring-2 hover:ring-dashed hover:ring-orange-300'
              )}
              aria-label="Edit label"
              type="button"
            />
            <BannerLabel
              label={frameLabel}
              fontSize={fontSize}
              fontFamily={fontFamily}
              icon={style.frameIcon}
              iconPosition={style.frameIconPosition}
              bgColor={style.frameBgColor}
              position="bottom"
            />
          </div>
        )}

        {/* Speech bubble pointer */}
        {frameStyle === 'speech-bubble' && (
          <SpeechBubblePointer
            direction={style.frameSpeechPointer || 'bottom'}
            color={style.frameBorderColor}
          />
        )}

        {/* Minimal line bottom */}
        {frameStyle === 'minimal-line' && (
          <MinimalLine position="bottom" color={style.frameBorderColor} />
        )}
      </div>

      {/* Google Font label preview */}
      {style.googleFontFamily && hasLabel && (
        <div
          className="mt-1 text-[10px] text-gray-400 dark:text-gray-500"
          style={{ fontFamily: labelFontFamily }}
        >
          {style.googleFontFamily}
        </div>
      )}
    </div>
  );
});

StudioPreview.displayName = 'StudioPreview';
