import { useLayoutContext, useRoomContext } from "../context";
import React from "react";
import { useWhiteboard } from "../hooks";

export interface WhiteboardIndicaterProps {
    shareScreenTracks?: number;
    parentCallback: () => void;
}

export function WhiteboardIndicater({
    shareScreenTracks,
    parentCallback,
}: WhiteboardIndicaterProps) {
    const room = useRoomContext();
    const { dispatch, state } = useLayoutContext().whiteboard;
    const participant = room.localParticipant;
    const encoder = new TextEncoder()
    const { isWhiteboardHost, isWhiteboardShared } = useWhiteboard();
    const [disableWhiteboard, setDisableWhiteboard] = React.useState(false);
    const [title, setTitle] = React.useState("Whiteboard");

    React.useEffect(() => {
        if (shareScreenTracks !== 0) {
            setDisableWhiteboard(true);
            setTitle("Whiteboard");
        }
        else if (isWhiteboardShared) {
            if (isWhiteboardHost) {
                setDisableWhiteboard(false);
                setTitle("Close Whiteboard");
            } else {
                setDisableWhiteboard(true);
                setTitle("Whiteboard");
            }
        } else {
            setDisableWhiteboard(false);
            setTitle("Whiteboard");
        }

    }, [isWhiteboardHost, isWhiteboardShared, shareScreenTracks]);

    const toggleWhiteboard = async () => {
        if (!room) return;

        try {
            if (state?.show_whiteboard) {
                if (dispatch) {
                    dispatch({ msg: "hide_whiteboard" })
                }
                const strData = JSON.stringify({ openWhiteboard: false })
                const data = encoder.encode(strData);

                // publish lossy data to the entire room
                room.localParticipant.publishData(data, 0);
                updateMeta(false);
            } else {
                if (dispatch) {
                    dispatch({ msg: "show_whiteboard" })
                }
                const strData = JSON.stringify({ openWhiteboard: true })
                const data = encoder.encode(strData);

                // publish lossy data to the entire room
                room.localParticipant.publishData(data, 0);
                updateMeta(true);
            }
        } catch (e: any) {
            console.log(`ERROR: ${e.message}`);
        } finally {
            parentCallback();
            // console.log("Whiteboard toggle");
        }
    }

    const updateMeta = (data: Boolean) => {
        const postData = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ room: room.name, whiteboard: data, identity: participant.identity }),
        };

        fetch(`/api/update-room-meta`, postData).then(async (res) => {
            if (res.status) {
            } else {
                throw Error('Error fetching server url, check server logs');
            }
        });
    }

    return (
        <button disabled={disableWhiteboard} className="tl-blur lk-button" onClick={toggleWhiteboard}>
            {title}
        </button>
    )
}