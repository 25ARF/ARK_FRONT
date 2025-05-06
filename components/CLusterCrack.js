"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./CLusterCrack.module.css";

export default function ClusterAccordion() {
  // 더 많은 아코디언 항목 추가
  const [clusters, setClusters] = useState([
    {
      id: 1,
      title: "군집 1",
      count: 6,
      avgExpansionRate: "1.1mm/week",
      maxExpansionRate: "1.6mm/week",
      isOpen: true,
    },
    {
      id: 2,
      title: "군집 2",
      count: 4,
      avgExpansionRate: "0.9mm/week",
      maxExpansionRate: "1.3mm/week",
      isOpen: false,
    },
    {
      id: 3,
      title: "군집 3",
      count: 5,
      avgExpansionRate: "1.2mm/week",
      maxExpansionRate: "1.8mm/week",
      isOpen: false,
    },
    {
      id: 4,
      title: "군집 4",
      count: 3,
      avgExpansionRate: "0.8mm/week",
      maxExpansionRate: "1.4mm/week",
      isOpen: false,
    },
  ]);

  const totalClusters = clusters.reduce(
    (sum, cluster) => sum + cluster.count,
    0
  );

  const toggleCluster = (id) => {
    setClusters(
      clusters.map((cluster) => {
        if (cluster.id === id) {
          return { ...cluster, isOpen: !cluster.isOpen };
        }
        return cluster;
      })
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>군집 수</h2>
        <div className={styles.badge}>총 군집 수: {totalClusters}건</div>
      </div>

      <div className={styles.clusterListContainer}>
        <div className={styles.wrapper}>
          <div className={styles.clusterList}>
            {clusters.map((cluster) => (
              <div key={cluster.id} className={styles.clusterItem}>
                <div
                  className={styles.clusterHeader}
                  onClick={() => toggleCluster(cluster.id)}
                >
                  {cluster.isOpen ? (
                    <ChevronUp className={styles.icon} />
                  ) : (
                    <ChevronDown className={styles.icon} />
                  )}
                  <span className={styles.clusterTitle}>{cluster.title}</span>
                </div>

                {cluster.isOpen && (
                  <div className={styles.clusterContent}>
                    <ul className={styles.detailList}>
                      <li className={styles.detailItem}>
                        <span className={styles.bullet}>•</span>
                        <span>군집 수: {cluster.count}건</span>
                      </li>
                      <li className={styles.detailItem}>
                        <span className={styles.bullet}>•</span>
                        <span>평균 확장속도: {cluster.avgExpansionRate}</span>
                      </li>
                      <li className={styles.detailItem}>
                        <span className={styles.bullet}>•</span>
                        <span>최대 확장속도: {cluster.maxExpansionRate}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
