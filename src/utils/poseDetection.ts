import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

let poseNetModel: posenet.PoseNet | null = null;

export async function loadPoseNet() {
  if (!poseNetModel) {
    await tf.ready();
    poseNetModel = await posenet.load({
      architecture: "MobileNetV1",
      outputStride: 16,
      inputResolution: { width: 400, height: 600 },
      multiplier: 0.75
    });
  }
  return poseNetModel;
}

export async function detectJointsFromImage(
  imageElement: HTMLImageElement
): Promise<{
  shoulderLeft:  { x: number; y: number };
  shoulderRight: { x: number; y: number };
  waistLeft:     { x: number; y: number };
  waistRight:    { x: number; y: number };
  hipLeft:       { x: number; y: number };
  hipRight:      { x: number; y: number };
} | null> {
  try {
    const model = await loadPoseNet();
    const pose = await model.estimateSinglePose(imageElement, {
      flipHorizontal: false
    });

    const getKeypoint = (name: string) =>
      pose.keypoints.find(k => k.part === name);

    const leftShoulder  = getKeypoint("leftShoulder");
    const rightShoulder = getKeypoint("rightShoulder");
    const leftHip       = getKeypoint("leftHip");
    const rightHip      = getKeypoint("rightHip");

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return null;
    }

    // Check confidence scores
    if (
      leftShoulder.score < 0.3 ||
      rightShoulder.score < 0.3 ||
      leftHip.score < 0.3 ||
      rightHip.score < 0.3
    ) {
      return null;
    }

    const imgW = imageElement.naturalWidth  || imageElement.width;
    const imgH = imageElement.naturalHeight || imageElement.height;

    // Calculate waist as midpoint between shoulders and hips
    const waistLeftY  = (leftShoulder.position.y  + leftHip.position.y)  / 2;
    const waistRightY = (rightShoulder.position.y + rightHip.position.y) / 2;
    const waistLeftX  = (leftShoulder.position.x  + leftHip.position.x)  / 2;
    const waistRightX = (rightShoulder.position.x + rightHip.position.x) / 2;

    // Convert pixel positions to percentage of image dimensions
    return {
      shoulderLeft:  { x: (leftShoulder.position.x  / imgW) * 100, y: (leftShoulder.position.y  / imgH) * 100 },
      shoulderRight: { x: (rightShoulder.position.x / imgW) * 100, y: (rightShoulder.position.y / imgH) * 100 },
      waistLeft:     { x: (waistLeftX               / imgW) * 100, y: (waistLeftY               / imgH) * 100 },
      waistRight:    { x: (waistRightX              / imgW) * 100, y: (waistRightY              / imgH) * 100 },
      hipLeft:       { x: (leftHip.position.x       / imgW) * 100, y: (leftHip.position.y       / imgH) * 100 },
      hipRight:      { x: (rightHip.position.x      / imgW) * 100, y: (rightHip.position.y      / imgH) * 100 }
    };
  } catch (err) {
    console.log("[PoseNet] Detection failed:", err);
    return null;
  }
}
