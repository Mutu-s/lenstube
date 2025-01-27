import { useQuery } from '@apollo/client'
import MetaTags from '@components/Common/MetaTags'
import Timeline from '@components/Home/Timeline'
import TimelineShimmer from '@components/Shimmers/TimelineShimmer'
import { Loader } from '@components/UIElements/Loader'
import { NoDataFound } from '@components/UIElements/NoDataFound'
import logger from '@lib/logger'
import {
  LENS_CUSTOM_FILTERS,
  LENSTUBE_APP_ID,
  LENSTUBE_BYTES_APP_ID,
  SCROLL_ROOT_MARGIN
} from '@utils/constants'
import getCategoryName from '@utils/functions/getCategoryName'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useInView } from 'react-cool-inview'
import Custom404 from 'src/pages/404'
import {
  ExploreDocument,
  PaginatedResultInfo,
  PublicationMainFocus,
  PublicationSortCriteria,
  PublicationTypes
} from 'src/types/lens'
import { LenstubePublication } from 'src/types/local'

const ExploreCategory = () => {
  const { query } = useRouter()
  const categoryName = query.category as string
  const [videos, setVideos] = useState<LenstubePublication[]>([])
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()

  const request = {
    publicationTypes: [PublicationTypes.Post],
    limit: 16,
    sortCriteria: PublicationSortCriteria.Latest,
    sources: [LENSTUBE_APP_ID, LENSTUBE_BYTES_APP_ID],
    customFilters: LENS_CUSTOM_FILTERS,
    metadata: {
      tags: { oneOf: [categoryName] },
      mainContentFocus: [PublicationMainFocus.Video]
    }
  }

  const { data, loading, error, fetchMore } = useQuery(ExploreDocument, {
    variables: {
      request
    },
    skip: !query.category,
    onCompleted(data) {
      setPageInfo(data?.explorePublications?.pageInfo)
      setVideos(data?.explorePublications?.items as LenstubePublication[])
    }
  })

  const { observe } = useInView({
    rootMargin: SCROLL_ROOT_MARGIN,
    onEnter: async () => {
      try {
        const { data } = await fetchMore({
          variables: {
            request: {
              cursor: pageInfo?.next,
              ...request
            }
          }
        })
        setPageInfo(data?.explorePublications?.pageInfo)
        setVideos([
          ...videos,
          ...(data?.explorePublications?.items as LenstubePublication[])
        ])
      } catch (error) {
        logger.error('[Error Fetch Explore Category]', error)
      }
    }
  })
  if (!query.category) return <Custom404 />

  return (
    <>
      <MetaTags title={categoryName?.toString() || ''} />
      <div>
        <h1 className="font-semibold capitalize md:text-2xl">
          {getCategoryName(categoryName)}
        </h1>
        <div className="my-4">
          {loading && <TimelineShimmer />}
          {data?.explorePublications?.items?.length === 0 && (
            <NoDataFound isCenter withImage text="No videos found" />
          )}
          {!error && !loading && (
            <>
              <Timeline videos={videos} />
              {pageInfo?.next && videos.length !== pageInfo?.totalCount && (
                <span ref={observe} className="flex justify-center p-10">
                  <Loader />
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default ExploreCategory
