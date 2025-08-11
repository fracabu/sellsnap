import React from 'react';

interface PushButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'orange' | 'purple' | 'green' | 'blue' | 'red';
}

export const PushButton: React.FC<PushButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  variant = 'purple'
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'orange':
        return 'pushable-orange';
      case 'purple':
        return 'pushable-blue'; // uso blue per purple
      case 'green':
        return 'pushable-green';
      case 'red':
        return 'pushable';
      default:
        return 'pushable-blue'; // default purple
    }
  };

  return (
    <>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={getVariantClass()}
        style={{
          filter: disabled ? 'brightness(0.7)' : undefined
        }}
      >
        <span className="shadow"></span>
        <span className="edge"></span>
        <span className={`front ${className}`}>
          {children}
        </span>
      </button>

      <style jsx="true" global="true">{`
        .pushable {
          position: relative;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          outline-offset: 4px;
          transition: filter 250ms;
        }

        .shadow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: hsl(0deg 0% 0% / 0.25);
          will-change: transform;
          transform: translateY(2px);
          transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
        }

        .edge {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: linear-gradient(to left,
                  hsl(340deg 100% 16%) 0%,
                  hsl(340deg 100% 32%) 8%,
                  hsl(340deg 100% 32%) 92%,
                  hsl(340deg 100% 16%) 100%);
        }

        .front {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 12px 42px;
          border-radius: 12px;
          font-size: 1.25rem;
          color: white;
          background: hsl(345deg 100% 47%);
          will-change: transform;
          transform: translateY(-4px);
          transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
        }

        .pushable:hover {
          filter: brightness(110%);
        }

        .pushable:hover .front {
          transform: translateY(-6px);
          transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
        }

        .pushable:active .front {
          transform: translateY(-2px);
          transition: transform 34ms;
        }

        .pushable:hover .shadow {
          transform: translateY(4px);
          transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
        }

        .pushable:active .shadow {
          transform: translateY(1px);
          transition: transform 34ms;
        }

        .pushable:focus:not(:focus-visible) {
          outline: none;
        }

        /* green */
        .pushable-green {
          position: relative;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          outline-offset: 4px;
          transition: filter 250ms;
        }

        .pushable-green .shadow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: hsla(122, 92%, 28%, 0.25);
          will-change: transform;
          transform: translateY(2px);
          transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
        }

        .pushable-green .edge {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: linear-gradient(to left,
                  hsl(128, 94%, 20%) 0%,
                  hsl(155, 100%, 32%) 8%,
                  hsl(143, 62%, 23%) 92%,
                  hsl(123, 85%, 28%) 100%);
        }

        .pushable-green .front {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 12px 42px;
          border-radius: 12px;
          font-size: 1.25rem;
          color: white;
          background: green;
          will-change: transform;
          transform: translateY(-4px);
          transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
        }

        .pushable-green:hover {
          filter: brightness(110%);
        }

        .pushable-green:hover .front {
          transform: translateY(-6px);
          transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
        }

        .pushable-green:active .front {
          transform: translateY(-2px);
          transition: transform 34ms;
        }

        .pushable-green:hover .shadow {
          transform: translateY(4px);
          transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
        }

        .pushable-green:active .shadow {
          transform: translateY(1px);
          transition: transform 34ms;
        }

        .pushable-green:focus:not(:focus-visible) {
          outline: none;
        }

        /* orange */
        .pushable-orange {
          position: relative;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          outline-offset: 4px;
          transition: filter 250ms;
        }

        .pushable-orange .shadow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: hsla(30, 100%, 25%, 0.25);
          will-change: transform;
          transform: translateY(2px);
          transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
        }

        .pushable-orange .edge {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: linear-gradient(to left,
                  hsl(27, 86%, 33%) 0%,
                  hsl(48, 100%, 32%) 8%,
                  hsl(23, 89%, 40%) 92%,
                  hsl(36, 95%, 22%) 100%);
        }

        .pushable-orange .front {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 12px 42px;
          border-radius: 12px;
          font-size: 1.25rem;
          color: white;
          background: hsl(30, 100%, 40%);
          will-change: transform;
          transform: translateY(-4px);
          transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
        }

        .pushable-orange:hover {
          filter: brightness(110%);
        }

        .pushable-orange:hover .front {
          transform: translateY(-6px);
          transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
        }

        .pushable-orange:active .front {
          transform: translateY(-2px);
          transition: transform 34ms;
        }

        .pushable-orange:hover .shadow {
          transform: translateY(4px);
          transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
        }

        .pushable-orange:active .shadow {
          transform: translateY(1px);
          transition: transform 34ms;
        }

        .pushable-orange:focus:not(:focus-visible) {
          outline: none;
        }

        /* blue */
        .pushable-blue {
          position: relative;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          outline-offset: 4px;
          transition: filter 250ms;
        }

        .pushable-blue .shadow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: hsla(264, 100%, 25%, 0.25);
          will-change: transform;
          transform: translateY(2px);
          transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
        }

        .pushable-blue .edge {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: linear-gradient(to left,
                  hsl(264, 100%, 35%) 0%,
                  hsl(264, 100%, 50%) 8%,
                  hsl(264, 100%, 50%) 92%,
                  hsl(264, 100%, 35%) 100%);
        }

        .pushable-blue .front {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 12px 42px;
          border-radius: 12px;
          font-size: 1.25rem;
          color: white;
          background: hsl(264, 100%, 60%);
          will-change: transform;
          transform: translateY(-4px);
          transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
        }

        .pushable-blue:hover {
          filter: brightness(110%);
        }

        .pushable-blue:hover .front {
          transform: translateY(-6px);
          transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
        }

        .pushable-blue:active .front {
          transform: translateY(-2px);
          transition: transform 34ms;
        }

        .pushable-blue:hover .shadow {
          transform: translateY(4px);
          transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
        }

        .pushable-blue:active .shadow {
          transform: translateY(1px);
          transition: transform 34ms;
        }

        .pushable-blue:focus:not(:focus-visible) {
          outline: none;
        }
      `}</style>
    </>
  );
};