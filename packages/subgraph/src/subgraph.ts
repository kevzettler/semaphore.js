import { AxiosRequestConfig } from "axios"
import checkParameter from "./checkParameter"
import getURL from "./getURL"
import request from "./request"
import { Network } from "./types"

export default class Subgraph {
    private _url: string

    /**
     * Initializes the subgraph object with one of the supported networks.
     * @param network Supported Semaphore network.
     */
    constructor(network: Network = "arbitrum") {
        checkParameter(network, "network", "string")

        this._url = getURL(network)
    }

    /**
     * Returns the subgraph URL.
     * @returns Subgraph URL.
     */
    get url(): string {
        return this._url
    }

    /**
     * Returns the list of groups.
     * @param options Options to select the group parameters.
     * @returns List of groups.
     */
    async getGroups(options: { members?: boolean } = {}): Promise<any[]> {
        checkParameter(options, "options", "object")

        const { members = false } = options

        checkParameter(members, "members", "boolean")

        const config: AxiosRequestConfig = {
            method: "post",
            data: JSON.stringify({
                query: `{
                    groups {
                        id
                        depth
                        zeroValue
                        root
                        size
                        numberOfLeaves
                        admin
                        ${
                            members === true
                                ? `members(orderBy: index) {
                            identityCommitment
                        }`
                                : ""
                        }
                    }
                }`
            })
        }

        const { groups } = await request(this._url, config)

        if (members) {
            for (const group of groups) {
                group.members = group.members.map((member: any) => member.identityCommitment)
            }
        }

        return groups
    }

    /**
     * Returns a specific group.
     * @param groupId Group id.
     * @param options Options to select the group parameters.
     * @returns Specific group.
     */
    async getGroup(groupId: string, options: { members?: boolean } = {}): Promise<any> {
        checkParameter(groupId, "groupId", "string")
        checkParameter(options, "options", "object")

        const { members = false } = options

        checkParameter(members, "members", "boolean")

        const config: AxiosRequestConfig = {
            method: "post",
            data: JSON.stringify({
                query: `{
                    groups(where: { id: "${groupId}" }) {
                        id
                        depth
                        zeroValue
                        root
                        size
                        numberOfLeaves
                        admin
                        ${
                            members === true
                                ? `members(orderBy: index) {
                            identityCommitment
                        }`
                                : ""
                        }
                    }
                }`
            })
        }

        const { groups } = await request(this._url, config)

        if (members) {
            groups[0].members = groups[0].members.map((member: any) => member.identityCommitment)
        }

        return groups[0]
    }
}
