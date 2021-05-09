import ResourceGroupsTaggingAPI from 'aws-sdk/clients/resourcegroupstaggingapi'
import { logger } from '../../logger/logger'

/**
 * Returns all the tagged or previously tagged resources
 * 
 * @param {ResourceGroupsTaggingAPI} resourceGroupsTaggingAPIClient - The AWS ResourceGroupsTaggingAPI service client 
 * @param {ResourceGroupsTaggingAPI.TagFilterList} tagFilters - A list of tag filters to apply when searching
 * @param {ResourceGroupsTaggingAPI.PaginationToken} paginationToken - Specifies a PaginationToken response value
 *                                                                         from a previous request to indicate that you
 *                                                                         want the next page of results. Leave this
 *                                                                         parameter empty in your initial request.
 * @return {Promise<ResourceGroupsTaggingAPI.GetResourcesOutput>}
 */
 async function getResources(
  resourceGroupsTaggingAPIClient: ResourceGroupsTaggingAPI,
  tagFilters: ResourceGroupsTaggingAPI.TagFilterList,
  resourceTypeFilters: ResourceGroupsTaggingAPI.ResourceTypeFilterList,
  paginationToken?: ResourceGroupsTaggingAPI.PaginationToken
): Promise<ResourceGroupsTaggingAPI.Types.GetResourcesOutput> {
  // Request
  const params: ResourceGroupsTaggingAPI.GetResourcesInput = {
    TagFilters: tagFilters,
    ResourceTypeFilters: resourceTypeFilters
  }
  // Add PaginationToken if provided
  if (paginationToken) params.PaginationToken = paginationToken
  logger.info('ResourceGroupsTaggingAPI getResources request:', { params })

  // Response
  const response = await resourceGroupsTaggingAPIClient.getResources(params).promise()
  logger.info('ResourceGroupsTaggingAPI getResources response:', { response })

  return response
}

/**
 * Returns all the tagged or previously tagged resources recursively
 * 
 * @param {ResourceGroupsTaggingAPI} resourceGroupsTaggingAPIClient - The AWS ResourceGroupsTaggingAPI service client 
 * @param {ResourceGroupsTaggingAPI.TagFilterList} tagFilters - A list of tag filters to apply when searching
 * @param {ResourceGroupsTaggingAPI.PaginationToken} paginationToken - Specifies a PaginationToken response value
 *                                                                         from a previous request to indicate that you
 *                                                                         want the next page of results. Leave this
 *                                                                         parameter empty in your initial request
 * @return {Promise<ResourceGroupsTaggingAPI.Types.ResourceTagMappingList>}
 */
export async function getResourcesRecursive(
  resourceGroupsTaggingAPIClient: ResourceGroupsTaggingAPI,
  tagFilters: ResourceGroupsTaggingAPI.TagFilterList,
  resourceTypeFilters: ResourceGroupsTaggingAPI.ResourceTypeFilterList,
  paginationToken?: ResourceGroupsTaggingAPI.PaginationToken
): Promise<ResourceGroupsTaggingAPI.ResourceTagMappingList> {
  const response = await getResources(resourceGroupsTaggingAPIClient, tagFilters, resourceTypeFilters, paginationToken)
  const items: ResourceGroupsTaggingAPI.ResourceTagMappingList = response.ResourceTagMappingList || []

  // The base case
  if (!response.PaginationToken) return items

  // NextToken is present, continue with a subsequent operation
  const subResponse = await getResourcesRecursive(
    resourceGroupsTaggingAPIClient,
    tagFilters,
    resourceTypeFilters,
    response.PaginationToken
  )

  return items.concat(subResponse)
}
