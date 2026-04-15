import React from 'react'

const Skeleton = ({ width, height, borderRadius = 'var(--r-squircle)', className = '', style = {} }) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{
      width: width || '100%',
      height: height || '20px',
      borderRadius,
      ...style
    }}
  />
)

export default Skeleton
