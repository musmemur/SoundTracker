import styles from './index.module.scss';
import {MusicRelease} from "../MusicRelease";
import React, {useState} from "react";
import {Release} from "../../entities/Release.ts";
import {ReleaseWithRating} from "../../entities/ReleaseWithRating.ts";
import {SavedRelease} from "../../entities/SavedRelease.ts";

interface ReleaseSectionProps {
    sectionTitle: string;
    releases: Release[] | ReleaseWithRating[] | SavedRelease[];
    showAllProp?: boolean;
}

const ReleasesSection: React.FC<ReleaseSectionProps> = ({sectionTitle, releases, showAllProp}) => {
    const [showAll, setShowAll] = useState(showAllProp);

    const releasesToShow = showAll ? releases : releases.slice(0, 4);

    function isReleaseWithRating(release: Release | ReleaseWithRating | SavedRelease): release is ReleaseWithRating {
        return (release as ReleaseWithRating).rating !== undefined;
    }

    return(
        <div className={styles.releasesSection}>
            <div className={styles.releasesSectionTop}>
                <div>{sectionTitle}</div>
                {!showAllProp && releases.length > 4 && (
                    <button
                        className={styles.moreButton}
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Скрыть' : 'Больше'}
                    </button>
                )}
            </div>

            <div className={styles.releases}>
                {releasesToShow.map((release) => {
                    if (isReleaseWithRating(release)) {
                        return (
                            <MusicRelease
                                key={release.url}
                                name={release.name}
                                artist={release.artist}
                                image={release.image}
                                rating={release.rating}
                            />
                        );
                    }
                    return (
                        <MusicRelease
                            key={release.url}
                            name={release.name}
                            artist={release.artist}
                            image={release.image}
                        />
                    );
                })}
            </div>
        </div>
    )
}

export default ReleasesSection;