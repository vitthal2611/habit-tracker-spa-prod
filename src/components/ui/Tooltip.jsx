import { useState } from 'react'

export default function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false)

  if (!content) return children

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}>
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg max-w-xs">
            <div className="space-y-2">
              {content.environmentTips && (
                <div>
                  <div className="font-semibold text-blue-300">Environment Design Tips:</div>
                  <div className="text-gray-200">{content.environmentTips}</div>
                </div>
              )}
              {content.makeAttractive && (
                <div>
                  <div className="font-semibold text-green-300">Make It Attractive:</div>
                  <div className="text-gray-200">{content.makeAttractive}</div>
                </div>
              )}
              {content.makeEasy && (
                <div>
                  <div className="font-semibold text-yellow-300">Make It Easy (2-min version):</div>
                  <div className="text-gray-200">{content.makeEasy}</div>
                </div>
              )}
              {content.makeSatisfying && (
                <div>
                  <div className="font-semibold text-purple-300">Make It Satisfying:</div>
                  <div className="text-gray-200">{content.makeSatisfying}</div>
                </div>
              )}
            </div>
            <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}></div>
          </div>
        </div>
      )}
    </div>
  )
}