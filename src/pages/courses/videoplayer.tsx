import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: "auto",
      fluid: true,
    });

    playerRef.current.src({ type: "application/x-mpegURL", src: url });

    const player = playerRef.current;

    player.ready(() => {
      player.tech().on("loadedmetadata", () => {
        //@ts-ignore
        const qualityLevels = player.qualityLevels();
        //@ts-ignore
        const qualities = [];
        
        for (let i = 0; i < qualityLevels.length; i++) {
            qualities.push(qualityLevels[i]);
        }
        
        const MenuItem = videojs.getComponent("MenuItem");
        const MenuButton = videojs.getComponent("MenuButton");
        
        class QualityMenuItem extends MenuItem {
            constructor(player: Player, options: any) {
                super(player, {
                    ...options,
                    selectable: true,
                    selected: options.level.height === player.height(),
                });
            }
            
            handleClick() {
                //@ts-ignore
                const qualityLevels = this.player().qualityLevels();
                for (let i = 0; i < qualityLevels.length; i++) {
                    qualityLevels[i].enabled = (i === this.options_.index);
                }
            }
        }
        
        class QualityMenuButton extends MenuButton {
            constructor(player: Player, options: any) {
                super(player, options);
            }
            
            createItems() {
              //@ts-ignore
              return qualities.map((quality, index) => {
                  return new QualityMenuItem(this.player(), {
                      label: `${quality.height}p`,
                      index,
                      level: quality,
                    });
                });
            }
        }
        
        videojs.registerComponent("QualityMenuButton", QualityMenuButton);
        //@ts-ignore
        player.controlBar.addChild("QualityMenuButton", {});
      });
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [url]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoPlayer;