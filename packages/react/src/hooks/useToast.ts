import React from "react";


export function useToast() {
    const [showToast, setShowToast] = React.useState<boolean | string>(false);

    React.useEffect(() => {
        if (showToast) {
        setTimeout(() => {
            setShowToast(false);
        }, 3000)
        }
    }, [showToast]);

    return {showToast, setShowToast}
}