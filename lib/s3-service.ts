import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

interface S3Object {
  Key?: string
  LastModified?: Date
}

export interface AgentData {
  id: string
  name: string
  description: string
  role: string
  firstMessage: string
  avatarId: string
  avatarSrc: string
  status: string
  language: string
  tone: string
  voice: string
  voiceEnabled: boolean
  speed: string
  confidence: string
  motivation: string
  model: string
  conversationCount: number
  tools: string[]
  memory: boolean
  personality: string
  handoffRules: Array<{ condition: string; handoffTo: string }>
  updatedAt: Date
  version: string
  ragDatasources: string[]
  appVariables: Array<{ key: string; value: string }>
  pronunciationDictionaries: Array<{ word: string; pronunciation: string }>
  speedValue: number
  confidenceValue: number
  motivationValue: number
}

interface AgentListItem {
  agentId: string
  lastModified?: Date
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "app-bucket"

export async function saveAgentToS3(userId: string, agentId: string, agentData: AgentData) {
  const key = `user/${userId}/agents/${agentId}.json`
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(agentData),
    ContentType: "application/json",
  })

  try {
    await s3Client.send(command)
    return { success: true, key }
  } catch (error) {
    console.error("Error saving agent to S3:", error)
    throw error
  }
}

export async function getAgentFromS3(userId: string, agentId: string): Promise<AgentData> {
  const key = `user/${userId}/agents/${agentId}.json`
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  try {
    const response = await s3Client.send(command)
    const agentData = await response.Body?.transformToString()
    return JSON.parse(agentData || "{}")
  } catch (error) {
    console.error("Error getting agent from S3:", error)
    throw error
  }
}

export async function listUserAgents(userId: string): Promise<AgentListItem[]> {
  const prefix = `user/${userId}/agents/`
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  })

  try {
    const response = await s3Client.send(command)
    return response.Contents?.map((item: S3Object) => {
      const agentId = item.Key?.split("/").pop()?.replace(".json", "")
      return { agentId: agentId || "", lastModified: item.LastModified }
    }) || []
  } catch (error) {
    console.error("Error listing user agents:", error)
    throw error
  }
}

export async function deleteAgentFromS3(userId: string, agentId: string) {
  const key = `user/${userId}/agents/${agentId}.json`
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  try {
    await s3Client.send(command)
    return { success: true }
  } catch (error) {
    console.error("Error deleting agent from S3:", error)
    throw error
  }
} 