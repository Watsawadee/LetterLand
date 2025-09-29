import * as React from "react";
import Svg, {
  Path,
  SvgProps,
  Defs,
  FeFlood,
  G,
  Filter,
  FeColorMatrix,
  FeBlend,
  FeOffset,
  FeGaussianBlur,
  FeComposite,

} from "react-native-svg";

const TutorialIcon = (props: SvgProps) => (
  <Svg width={73} height={73} fill="none" viewBox="0 0 73 73" {...props}>
    <G filter="url(#filter0_d_1615_86)">
      <Path
        fill="#fff"
        d="m34.422 3.135 30.861 15.99 1.22 9.836L44.54 68.85 6.902 51.918z"
      ></Path>
    </G>
    <G filter="url(#filter2_d_1615_86)">
      <Path
        fill="#fff"
        d="m3.787 42.01 6.956 3.147-3.787 6.714-1.711-5.103z"
      ></Path>
    </G>
    <G filter="url(#filter4_d_1615_86)">
      <Path
        fill="#fff"
        d="m44.444 68.698-1.235-9.564 1.234-1.008 3.396 4.548z"
      ></Path>
    </G>
    <G filter="url(#filter5_d_1615_86)">
      <Path
        fill="#F95725"
        d="M27.494 0 65.22 17.07c1.007.455 1.383 1.604.84 2.567l-21.724 38.51c-.543.962-1.799 1.373-2.805.917L3.805 41.994z"
      ></Path>
    </G>
    <Path
      fill="#F2F8F9"
      d="m29.241 9.01-.404.838-1.666-.804-2.614 5.423-1.027-.495 2.614-5.423-1.676-.807.404-.838zm4.91 3.965-2.392 4.963-1.027-.495.282-.585q-.39.189-.874.178a2.25 2.25 0 0 1-.911-.228 2.5 2.5 0 0 1-.937-.751 2 2 0 0 1-.382-1.073q-.031-.603.294-1.279l1.407-2.918 1.018.49-1.333 2.766q-.321.666-.162 1.187.164.513.74.79.578.277 1.08.087.516-.195.837-.862l1.333-2.765zm2.15 2.068-1.325 2.748q-.135.279-.07.466.08.182.395.334l.63.304-.412.856-.81-.391q-.695-.334-.908-.837t.14-1.232l1.323-2.747-.585-.282.404-.838.585.282.595-1.234 1.036.5-.595 1.233 1.207.582-.404.838zm2.278 6.283a2.85 2.85 0 0 1-1.118-.928 2.6 2.6 0 0 1-.458-1.33q-.042-.743.327-1.508.366-.757.98-1.182.616-.425 1.345-.462.728-.038 1.44.306.711.342 1.136.936.425.593.476 1.34.052.746-.314 1.502-.364.757-.99 1.177-.624.42-1.375.459a3 3 0 0 1-1.449-.31m.43-.892q.396.19.83.167a1.6 1.6 0 0 0 .841-.294q.398-.274.66-.815.26-.54.23-1.01a1.54 1.54 0 0 0-.276-.832 1.67 1.67 0 0 0-.647-.545 1.67 1.67 0 0 0-.83-.167 1.5 1.5 0 0 0-.805.311q-.376.274-.637.815-.386.802-.193 1.438.206.632.827.932m6.273-1.206q.408-.27.877-.3.481-.032.996.214l-.513 1.063-.261-.125q-.603-.291-1.066-.137-.454.158-.82.915l-1.258 2.613-1.027-.495 2.392-4.964 1.027.495zm3.617.045a.7.7 0 0 1-.377-.415.7.7 0 0 1 .036-.56.7.7 0 0 1 .415-.377.7.7 0 0 1 .56.037q.27.13.368.41a.7.7 0 0 1-.037.56.7.7 0 0 1-.414.377.7.7 0 0 1-.551-.032m.187.9-2.392 4.964-1.027-.495 2.392-4.963zm-.179 2.945q.36-.748.945-1.177a2.54 2.54 0 0 1 2.622-.235q.585.282.905.725.333.438.429.906l.347-.72 1.036.499-2.392 4.963-1.036-.499.356-.739q-.431.226-.994.243a2.44 2.44 0 0 1-1.14-.26 2.45 2.45 0 0 1-1.015-.89 2.7 2.7 0 0 1-.404-1.326q-.02-.743.341-1.49m4.054 1.976q.247-.515.214-.996a1.6 1.6 0 0 0-.272-.842 1.6 1.6 0 0 0-.643-.554 1.6 1.6 0 0 0-.834-.158 1.6 1.6 0 0 0-.832.299q-.386.27-.633.783a2.1 2.1 0 0 0-.227 1q.03.492.272.864a1.64 1.64 0 0 0 1.477.712q.438-.033.828-.312.402-.282.65-.796m5.426-2.536-3.212 6.666-1.027-.494 3.212-6.667z"
    ></Path>
    <Path
      fill="#fff"
      d="M34.464 42.18a7.716 7.716 0 1 0 0-15.432 7.716 7.716 0 0 0 0 15.432"
      opacity="0.95"
    ></Path>
    <Path
      fill="#2B3340"
      d="M32.005 36.865c-.265.567-.12 1.194.322 1.4.443.207 1.016-.085 1.28-.652l1.677-3.594c.264-.567.12-1.194-.323-1.4-.443-.207-1.016.085-1.28.652zM36.007 31.892a1.029 1.029 0 1 0 0-2.057 1.029 1.029 0 0 0 0 2.057"
    ></Path>
    <Defs>
      <Filter
        id="filter0_d_1615_86"
        width="63.602"
        height="69.716"
        x="4.902"
        y="3.135"
        filterUnits="userSpaceOnUse"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix"></FeFlood>
        <FeColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        ></FeColorMatrix>
        <FeOffset dy="2"></FeOffset>
        <FeGaussianBlur stdDeviation="1"></FeGaussianBlur>
        <FeComposite in2="hardAlpha" operator="out"></FeComposite>
        <FeColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"></FeColorMatrix>
        <FeBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1615_86"
        ></FeBlend>
        <FeBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1615_86"
          result="shape"
        ></FeBlend>
      </Filter>
      <Filter
        id="filter2_d_1615_86"
        width="10.955"
        height="13.861"
        x="1.787"
        y="42.01"
        filterUnits="userSpaceOnUse"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix"></FeFlood>
        <FeColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        ></FeColorMatrix>
        <FeOffset dy="2"></FeOffset>
        <FeGaussianBlur stdDeviation="1"></FeGaussianBlur>
        <FeComposite in2="hardAlpha" operator="out"></FeComposite>
        <FeColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"></FeColorMatrix>
        <FeBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1615_86"
        ></FeBlend>
        <FeBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1615_86"
          result="shape"
        ></FeBlend>
      </Filter>
      <Filter
        id="filter4_d_1615_86"
        width="8.629"
        height="14.572"
        x="41.209"
        y="58.126"
        filterUnits="userSpaceOnUse"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix"></FeFlood>
        <FeColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        ></FeColorMatrix>
        <FeOffset dy="2"></FeOffset>
        <FeGaussianBlur stdDeviation="1"></FeGaussianBlur>
        <FeComposite in2="hardAlpha" operator="out"></FeComposite>
        <FeColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"></FeColorMatrix>
        <FeBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1615_86"
        ></FeBlend>
        <FeBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1615_86"
          result="shape"
        ></FeBlend>
      </Filter>
      <Filter
        id="filter5_d_1615_86"
        width="66.502"
        height="63.25"
        x="1.805"
        y="0"
        filterUnits="userSpaceOnUse"
      >
        <FeFlood floodOpacity="0" result="BackgroundImageFix"></FeFlood>
        <FeColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        ></FeColorMatrix>
        <FeOffset dy="2"></FeOffset>
        <FeGaussianBlur stdDeviation="1"></FeGaussianBlur>
        <FeComposite in2="hardAlpha" operator="out"></FeComposite>
        <FeColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"></FeColorMatrix>
        <FeBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1615_86"
        ></FeBlend>
        <FeBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1615_86"
          result="shape"
        ></FeBlend>
      </Filter>
    </Defs>
  </Svg>
);

export default TutorialIcon;
