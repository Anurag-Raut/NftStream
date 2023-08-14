//Modal.tsx
import React, { Children, useRef } from "react";
import cn from "classnames";
import { useOnClickOutside } from "usehooks-ts";

const Toggle = ({children,open,handleToggle}) => {
  const ref = useRef(null);
  

  const modalClass = cn({
    "modal modal-bottom sm:modal-middle": true,
    "modal-open": open,
  });
  return (
    <div className={modalClass}>
      <div className="modal-box" ref={ref}>
        {
          ...children
        }

      </div>
    </div>
  );
};

export default Toggle;