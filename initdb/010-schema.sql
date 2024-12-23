-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: gcdhmsqlqas1.ugent.be
-- Gegenereerd op: 23 dec 2024 om 12:32
-- Serverversie: 10.11.10-MariaDB-deb11
-- PHP-versie: 8.2.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_dibe`
--
CREATE DATABASE IF NOT EXISTS `db_dibe` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_dibe`;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `actor`
--

CREATE TABLE `actor` (
  `actor_id` bigint(20) UNSIGNED NOT NULL,
  `published` tinyint(1) NOT NULL,
  `actor_capacity_id` bigint(20) UNSIGNED NOT NULL,
  `actor_capacity_published` tinyint(1) NOT NULL,
  `actor_name_id` bigint(20) UNSIGNED NOT NULL,
  `actor_name_published` tinyint(1) NOT NULL,
  `place_id` bigint(20) UNSIGNED NOT NULL,
  `place_published` tinyint(1) NOT NULL,
  `actor_order_id` int(10) UNSIGNED DEFAULT NULL,
  `actor_place_institute_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `actor_capacity`
--

CREATE TABLE `actor_capacity` (
  `actor_capacity_id` bigint(20) UNSIGNED NOT NULL,
  `name_nl` varchar(330) NOT NULL,
  `name_fr` varchar(330) NOT NULL,
  `name_en` varchar(330) NOT NULL,
  `published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `actor_name`
--

CREATE TABLE `actor_name` (
  `actor_name_id` bigint(20) UNSIGNED NOT NULL,
  `name_nl` longtext NOT NULL,
  `name_fr` longtext NOT NULL,
  `name_en` longtext NOT NULL,
  `published` tinyint(1) NOT NULL,
  `actor_standardized_name_id` bigint(20) UNSIGNED NOT NULL,
  `actor_standardized_name_published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `actor_name_variant`
--

CREATE TABLE `actor_name_variant` (
  `actor_name_variant_id` bigint(20) UNSIGNED NOT NULL,
  `actor_standardized_name_id` bigint(20) UNSIGNED NOT NULL,
  `name` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `actor_order`
--

CREATE TABLE `actor_order` (
  `actor_order_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `actor_place_institute`
--

CREATE TABLE `actor_place_institute` (
  `actor_place_institute_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `actor_standardized_name`
--

CREATE TABLE `actor_standardized_name` (
  `actor_standardized_name_id` bigint(20) UNSIGNED NOT NULL,
  `actor_standardized_name` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter`
--

CREATE TABLE `charter` (
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `summary_nl` longtext NOT NULL,
  `summary_fr` longtext NOT NULL,
  `summary_en` longtext NOT NULL,
  `full_text` longtext DEFAULT NULL,
  `full_text_annotated` longtext DEFAULT NULL,
  `full_text_stripped` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL,
  `place_id` bigint(20) UNSIGNED DEFAULT NULL,
  `place_found_name` longtext DEFAULT NULL,
  `place_published` tinyint(1) NOT NULL,
  `edition_indication_id` bigint(20) UNSIGNED DEFAULT NULL,
  `edition_id` bigint(20) UNSIGNED DEFAULT NULL,
  `edition_indication_published` tinyint(1) NOT NULL,
  `charter_authenticity_id` int(10) UNSIGNED DEFAULT NULL,
  `charter_nature_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter_actor_role`
--

CREATE TABLE `charter_actor_role` (
  `charter_actor_role_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter_authenticity`
--

CREATE TABLE `charter_authenticity` (
  `charter_authenticity_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter_language`
--

CREATE TABLE `charter_language` (
  `charter_language_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter_nature`
--

CREATE TABLE `charter_nature` (
  `charter_nature_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter_type`
--

CREATE TABLE `charter_type` (
  `charter_type_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter_udt`
--

CREATE TABLE `charter_udt` (
  `charter_udt_id` int(10) UNSIGNED NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(300) NOT NULL,
  `year` mediumint(9) NOT NULL DEFAULT 0,
  `month` mediumint(9) NOT NULL DEFAULT 0,
  `day` mediumint(9) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter__actor`
--

CREATE TABLE `charter__actor` (
  `charter__actor_id` int(10) UNSIGNED NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` bigint(20) UNSIGNED NOT NULL,
  `published` tinyint(1) NOT NULL,
  `charter_actor_role_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter__charter_language`
--

CREATE TABLE `charter__charter_language` (
  `charter__charter_language_id` bigint(20) UNSIGNED NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `charter_language_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter__charter_type`
--

CREATE TABLE `charter__charter_type` (
  `charter__charter_type_id` bigint(20) UNSIGNED NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `charter_type_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter__codex`
--

CREATE TABLE `charter__codex` (
  `charter__codex_id` int(10) UNSIGNED NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `codex_id` bigint(20) UNSIGNED NOT NULL,
  `published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter__codex_url`
--

CREATE TABLE `charter__codex_url` (
  `charter__codex_url_id` bigint(20) UNSIGNED NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `codex_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter__edition_indication`
--

CREATE TABLE `charter__edition_indication` (
  `charter__edition_indication_id` int(10) UNSIGNED NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `edition_indication_id` bigint(20) UNSIGNED NOT NULL,
  `edition_id` bigint(20) UNSIGNED NOT NULL,
  `published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `charter__secondary_literature_indication`
--

CREATE TABLE `charter__secondary_literature_indication` (
  `charter__secondary_literature_indication_id` int(10) UNSIGNED NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `secondary_literature_indication_id` bigint(20) UNSIGNED NOT NULL,
  `secondary_literature_id` bigint(20) UNSIGNED NOT NULL,
  `published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `codex`
--

CREATE TABLE `codex` (
  `codex_id` bigint(20) UNSIGNED NOT NULL,
  `stein_number` varchar(330) DEFAULT NULL,
  `title_nl` longtext DEFAULT NULL,
  `title_fr` longtext DEFAULT NULL,
  `title_en` longtext DEFAULT NULL,
  `redaction_date_nl` longtext DEFAULT NULL,
  `redaction_date_fr` longtext DEFAULT NULL,
  `redaction_date_en` longtext DEFAULT NULL,
  `pages` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL,
  `repository_id` bigint(20) UNSIGNED DEFAULT NULL,
  `repository_reference_number` varchar(300) DEFAULT NULL,
  `repository_published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `codex_external_image_url`
--

CREATE TABLE `codex_external_image_url` (
  `codex_external_image_url_id` bigint(20) UNSIGNED NOT NULL,
  `codex_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `codex_institution`
--

CREATE TABLE `codex_institution` (
  `codex_institution_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `codex_material`
--

CREATE TABLE `codex_material` (
  `codex_material_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `codex_name_author`
--

CREATE TABLE `codex_name_author` (
  `codex_name_author_id` bigint(20) UNSIGNED NOT NULL,
  `codex_id` bigint(20) UNSIGNED NOT NULL,
  `name` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `codex_url`
--

CREATE TABLE `codex_url` (
  `codex_url_id` bigint(20) UNSIGNED NOT NULL,
  `codex_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `codex__codex_institution`
--

CREATE TABLE `codex__codex_institution` (
  `codex__codex_institution_id` bigint(20) UNSIGNED NOT NULL,
  `codex_id` bigint(20) UNSIGNED NOT NULL,
  `codex_institution_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `codex__codex_material`
--

CREATE TABLE `codex__codex_material` (
  `codex__codex_material_id` bigint(20) UNSIGNED NOT NULL,
  `codex_id` bigint(20) UNSIGNED NOT NULL,
  `codex_material_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `copy`
--

CREATE TABLE `copy` (
  `copy_id` bigint(20) UNSIGNED NOT NULL,
  `loose` tinyint(1) NOT NULL DEFAULT 0,
  `published` tinyint(1) NOT NULL,
  `charter_id` bigint(20) UNSIGNED DEFAULT NULL,
  `charter_published` tinyint(1) NOT NULL,
  `codex_id` bigint(20) UNSIGNED DEFAULT NULL,
  `codex_pof` varchar(300) DEFAULT NULL,
  `codex_sequence_number` varchar(300) DEFAULT NULL,
  `codex_published` tinyint(1) NOT NULL,
  `repository_id` bigint(20) UNSIGNED DEFAULT NULL,
  `repository_reference_number` varchar(300) DEFAULT NULL,
  `repository_published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `copy_external_image_url`
--

CREATE TABLE `copy_external_image_url` (
  `copy_external_image_url_id` bigint(20) UNSIGNED NOT NULL,
  `copy_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `copy_url`
--

CREATE TABLE `copy_url` (
  `copy_url_id` bigint(20) UNSIGNED NOT NULL,
  `copy_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `datation`
--

CREATE TABLE `datation` (
  `datation_id` bigint(20) UNSIGNED NOT NULL,
  `researcher` longtext DEFAULT NULL,
  `preference` bigint(20) UNSIGNED NOT NULL,
  `published` tinyint(1) NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `charter_published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `datation_time`
--

CREATE TABLE `datation_time` (
  `datation_time_id` bigint(20) UNSIGNED NOT NULL,
  `year` mediumint(9) DEFAULT NULL,
  `month` mediumint(9) DEFAULT NULL,
  `day` mediumint(9) DEFAULT NULL,
  `interpretation` varchar(300) DEFAULT NULL,
  `published` tinyint(1) NOT NULL,
  `datation_id` bigint(20) UNSIGNED NOT NULL,
  `datation_comments_nl` longtext DEFAULT NULL,
  `datation_comments_fr` longtext DEFAULT NULL,
  `datation_comments_en` longtext DEFAULT NULL,
  `datation_published` tinyint(1) NOT NULL,
  `datation_time_originality_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `datation_time_originality`
--

CREATE TABLE `datation_time_originality` (
  `datation_time_originality_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `diocese`
--

CREATE TABLE `diocese` (
  `diocese_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `edition`
--

CREATE TABLE `edition` (
  `edition_id` bigint(20) UNSIGNED NOT NULL,
  `full_title` longtext NOT NULL,
  `names_editors` longtext NOT NULL,
  `date_of_edition_year` mediumint(8) UNSIGNED DEFAULT NULL,
  `date_of_edition_month` mediumint(8) UNSIGNED DEFAULT NULL,
  `date_of_edition_day` mediumint(8) UNSIGNED DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `edition_indication`
--

CREATE TABLE `edition_indication` (
  `edition_indication_id` bigint(20) UNSIGNED NOT NULL,
  `bookpart` varchar(330) DEFAULT NULL,
  `nr` varchar(330) DEFAULT NULL,
  `pages` varchar(330) DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL,
  `edition_id` bigint(20) UNSIGNED NOT NULL,
  `edition_published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `edition_indication_url`
--

CREATE TABLE `edition_indication_url` (
  `edition_indication_url_id` bigint(20) UNSIGNED NOT NULL,
  `edition_indication_id` bigint(20) UNSIGNED NOT NULL,
  `edition_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `edition_url`
--

CREATE TABLE `edition_url` (
  `edition_url_id` bigint(20) UNSIGNED NOT NULL,
  `edition_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `flag`
--

CREATE TABLE `flag` (
  `flag_id` bigint(20) UNSIGNED NOT NULL,
  `flag` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `ikvti`
--

CREATE TABLE `ikvti` (
  `ikvti_id` bigint(20) UNSIGNED NOT NULL,
  `year_a_start` mediumint(9) NOT NULL,
  `month_a_start` mediumint(9) NOT NULL,
  `day_a_start` mediumint(9) NOT NULL,
  `year_b_start` mediumint(9) NOT NULL,
  `month_b_start` mediumint(9) NOT NULL,
  `day_b_start` mediumint(9) NOT NULL,
  `year_c_start` mediumint(9) NOT NULL,
  `month_c_start` mediumint(9) NOT NULL,
  `day_c_start` mediumint(9) NOT NULL,
  `year_d_start` mediumint(9) NOT NULL,
  `month_d_start` mediumint(9) NOT NULL,
  `day_d_start` mediumint(9) NOT NULL,
  `year_a_end` mediumint(9) NOT NULL,
  `month_a_end` mediumint(9) NOT NULL,
  `day_a_end` mediumint(9) NOT NULL,
  `year_b_end` mediumint(9) NOT NULL,
  `month_b_end` mediumint(9) NOT NULL,
  `day_b_end` mediumint(9) NOT NULL,
  `year_c_end` mediumint(9) NOT NULL,
  `month_c_end` mediumint(9) NOT NULL,
  `day_c_end` mediumint(9) NOT NULL,
  `year_d_end` mediumint(9) NOT NULL,
  `month_d_end` mediumint(9) NOT NULL,
  `day_d_end` mediumint(9) NOT NULL,
  `published` tinyint(1) NOT NULL,
  `ikvti_datation_id` bigint(20) UNSIGNED NOT NULL,
  `ikvti_datation_originality_nl` longtext DEFAULT NULL,
  `ikvti_datation_originality_fr` longtext DEFAULT NULL,
  `ikvti_datation_originality_en` longtext DEFAULT NULL,
  `ikvti_datation_comments_nl` longtext DEFAULT NULL,
  `ikvti_datation_comments_fr` longtext DEFAULT NULL,
  `ikvti_datation_comments_en` longtext DEFAULT NULL,
  `ikvti_datation_published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `image`
--

CREATE TABLE `image` (
  `image_id` bigint(20) UNSIGNED NOT NULL,
  `image_file` longtext NOT NULL,
  `description_nl` longtext DEFAULT NULL,
  `description_fr` longtext DEFAULT NULL,
  `description_en` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL,
  `original_id` bigint(20) UNSIGNED DEFAULT NULL,
  `original_sequence_number` smallint(5) UNSIGNED NOT NULL,
  `original_published` tinyint(1) NOT NULL,
  `copy_id` bigint(20) UNSIGNED DEFAULT NULL,
  `copy_sequence_number` smallint(5) UNSIGNED NOT NULL,
  `copy_published` tinyint(1) NOT NULL,
  `codex_id` bigint(20) UNSIGNED DEFAULT NULL,
  `codex_sequence_number` smallint(5) UNSIGNED NOT NULL,
  `codex_published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `log`
--

CREATE TABLE `log` (
  `log_id` bigint(20) UNSIGNED NOT NULL,
  `timestamp` datetime NOT NULL,
  `instruction` longtext NOT NULL,
  `description` longtext NOT NULL,
  `log_person_accountname` varchar(330) NOT NULL,
  `result` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `original`
--

CREATE TABLE `original` (
  `original_id` bigint(20) UNSIGNED NOT NULL,
  `published` tinyint(1) NOT NULL,
  `charter_id` bigint(20) UNSIGNED DEFAULT NULL,
  `charter_published` tinyint(1) NOT NULL,
  `codex_id` bigint(20) UNSIGNED DEFAULT NULL,
  `codex_published` tinyint(1) NOT NULL,
  `repository_id` bigint(20) UNSIGNED DEFAULT NULL,
  `repository_reference_number` varchar(330) DEFAULT NULL,
  `repository_published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `original_external_image_url`
--

CREATE TABLE `original_external_image_url` (
  `original_external_image_url_id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `original_url`
--

CREATE TABLE `original_url` (
  `original_url_id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `place`
--

CREATE TABLE `place` (
  `place_id` bigint(20) UNSIGNED NOT NULL,
  `name_nl` longtext NOT NULL,
  `name_fr` longtext NOT NULL,
  `name_en` longtext NOT NULL,
  `name_regio` longtext NOT NULL,
  `latitude` longtext DEFAULT NULL,
  `longitude` longtext DEFAULT NULL,
  `diocese_explanation_nl` longtext DEFAULT NULL,
  `diocese_explanation_fr` longtext DEFAULT NULL,
  `diocese_explanation_en` longtext DEFAULT NULL,
  `principality_explanation_nl` longtext DEFAULT NULL,
  `principality_explanation_fr` longtext DEFAULT NULL,
  `principality_explanation_en` longtext DEFAULT NULL,
  `url` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL,
  `place_localisation_id` bigint(20) UNSIGNED NOT NULL,
  `place_localisation_published` tinyint(1) NOT NULL,
  `diocese_id` int(10) UNSIGNED DEFAULT NULL,
  `principality_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `place_localisation`
--

CREATE TABLE `place_localisation` (
  `place_localisation_id` bigint(20) UNSIGNED NOT NULL,
  `echelon_1_nl` longtext DEFAULT NULL,
  `echelon_1_fr` longtext DEFAULT NULL,
  `echelon_1_en` longtext DEFAULT NULL,
  `echelon_2_nl` longtext DEFAULT NULL,
  `echelon_2_fr` longtext DEFAULT NULL,
  `echelon_2_en` longtext DEFAULT NULL,
  `echelon_3_nl` longtext DEFAULT NULL,
  `echelon_3_fr` longtext DEFAULT NULL,
  `echelon_3_en` longtext DEFAULT NULL,
  `echelon_4_nl` longtext DEFAULT NULL,
  `echelon_4_fr` longtext DEFAULT NULL,
  `echelon_4_en` longtext DEFAULT NULL,
  `echelon_5_nl` longtext DEFAULT NULL,
  `echelon_5_fr` longtext DEFAULT NULL,
  `echelon_5_en` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL,
  `place_localisation_land_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `place_localisation_land`
--

CREATE TABLE `place_localisation_land` (
  `place_localisation_land_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `principality`
--

CREATE TABLE `principality` (
  `principality_id` int(10) UNSIGNED NOT NULL,
  `name_nl` varchar(255) DEFAULT NULL,
  `name_fr` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `repository`
--

CREATE TABLE `repository` (
  `repository_id` bigint(20) UNSIGNED NOT NULL,
  `name_nl` longtext NOT NULL,
  `name_fr` longtext NOT NULL,
  `name_en` longtext NOT NULL,
  `location_nl` longtext NOT NULL,
  `location_fr` longtext NOT NULL,
  `location_en` longtext NOT NULL,
  `class_nl` longtext DEFAULT NULL,
  `class_fr` longtext DEFAULT NULL,
  `class_en` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `repository_url`
--

CREATE TABLE `repository_url` (
  `repository_url_id` bigint(20) UNSIGNED NOT NULL,
  `repository_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `secondary_literature`
--

CREATE TABLE `secondary_literature` (
  `secondary_literature_id` bigint(20) UNSIGNED NOT NULL,
  `full_title` longtext NOT NULL,
  `names_authors` longtext NOT NULL,
  `date_of_publication_year` mediumint(8) UNSIGNED DEFAULT NULL,
  `date_of_publication_month` mediumint(8) UNSIGNED DEFAULT NULL,
  `date_of_publication_day` mediumint(8) UNSIGNED DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `secondary_literature_indication`
--

CREATE TABLE `secondary_literature_indication` (
  `secondary_literature_indication_id` bigint(20) UNSIGNED NOT NULL,
  `bookpart` varchar(330) DEFAULT NULL,
  `nr` varchar(330) DEFAULT NULL,
  `pages` varchar(330) NOT NULL,
  `comments` longtext DEFAULT NULL,
  `published` tinyint(1) NOT NULL,
  `secondary_literature_id` bigint(20) UNSIGNED NOT NULL,
  `secondary_literature_published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `secondary_literature_indication_url`
--

CREATE TABLE `secondary_literature_indication_url` (
  `secondary_literature_indication_url_id` bigint(20) UNSIGNED NOT NULL,
  `secondary_literature_indication_id` bigint(20) UNSIGNED NOT NULL,
  `secondary_literature_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `secondary_literature_url`
--

CREATE TABLE `secondary_literature_url` (
  `secondary_literature_url_id` bigint(20) UNSIGNED NOT NULL,
  `secondary_literature_id` bigint(20) UNSIGNED NOT NULL,
  `url` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `vidimus`
--

CREATE TABLE `vidimus` (
  `vidimus_id` int(10) UNSIGNED NOT NULL,
  `charter_id` bigint(20) UNSIGNED NOT NULL,
  `related_charter_id` bigint(20) UNSIGNED NOT NULL,
  `published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Indexen voor geëxporteerde tabellen
--

--
-- Indexen voor tabel `actor`
--
ALTER TABLE `actor`
  ADD PRIMARY KEY (`actor_id`),
  ADD UNIQUE KEY `actor_id` (`actor_id`),
  ADD KEY `index_actor_name_id` (`actor_name_id`),
  ADD KEY `index_actor_place_id` (`place_id`),
  ADD KEY `index_actor_capacity_id` (`actor_capacity_id`),
  ADD KEY `actor__actor_order_id_idx` (`actor_order_id`) USING BTREE,
  ADD KEY `actor__actor_place_institute_id_idx` (`actor_place_institute_id`) USING BTREE;

--
-- Indexen voor tabel `actor_capacity`
--
ALTER TABLE `actor_capacity`
  ADD PRIMARY KEY (`actor_capacity_id`),
  ADD UNIQUE KEY `capacity_id` (`actor_capacity_id`),
  ADD KEY `index_capacity_nl` (`name_nl`),
  ADD KEY `index_capacity_fr` (`name_fr`),
  ADD KEY `index_capacity_en` (`name_en`);

--
-- Indexen voor tabel `actor_name`
--
ALTER TABLE `actor_name`
  ADD PRIMARY KEY (`actor_name_id`),
  ADD KEY `index_name_name_standardizedname_id` (`actor_standardized_name_id`),
  ADD KEY `index_full_name_nl` (`name_nl`(330)),
  ADD KEY `index_full_name_fr` (`name_fr`(330)),
  ADD KEY `index_full_name_en` (`name_en`(330));

--
-- Indexen voor tabel `actor_name_variant`
--
ALTER TABLE `actor_name_variant`
  ADD PRIMARY KEY (`actor_name_variant_id`),
  ADD UNIQUE KEY `dummy_id` (`actor_name_variant_id`),
  ADD KEY `index_standardizedname_id` (`actor_standardized_name_id`),
  ADD KEY `index_variant_variant` (`name`(330));

--
-- Indexen voor tabel `actor_order`
--
ALTER TABLE `actor_order`
  ADD PRIMARY KEY (`actor_order_id`);

--
-- Indexen voor tabel `actor_place_institute`
--
ALTER TABLE `actor_place_institute`
  ADD PRIMARY KEY (`actor_place_institute_id`);

--
-- Indexen voor tabel `actor_standardized_name`
--
ALTER TABLE `actor_standardized_name`
  ADD PRIMARY KEY (`actor_standardized_name_id`),
  ADD UNIQUE KEY `standardizedname_id` (`actor_standardized_name_id`),
  ADD KEY `index_standardizedname_standardizedname` (`actor_standardized_name`(330));

--
-- Indexen voor tabel `charter`
--
ALTER TABLE `charter`
  ADD PRIMARY KEY (`charter_id`),
  ADD KEY `charter_edition_indication_id` (`edition_indication_id`,`edition_id`),
  ADD KEY `index_charter_place_id` (`place_id`),
  ADD KEY `index_charter_edition_indication_id` (`edition_indication_id`),
  ADD KEY `index_charter_edition_indication_edition_id` (`edition_id`),
  ADD KEY `index_charter_place_found_name` (`place_found_name`(330)),
  ADD KEY `published` (`published`),
  ADD KEY `charter_place_published` (`place_published`),
  ADD KEY `cei_published` (`edition_indication_published`),
  ADD KEY `charter__charter_authenticity_id_idx` (`charter_authenticity_id`) USING BTREE,
  ADD KEY `charter__charter_nature_id_idx` (`charter_nature_id`) USING BTREE;

--
-- Indexen voor tabel `charter_actor_role`
--
ALTER TABLE `charter_actor_role`
  ADD PRIMARY KEY (`charter_actor_role_id`);

--
-- Indexen voor tabel `charter_authenticity`
--
ALTER TABLE `charter_authenticity`
  ADD PRIMARY KEY (`charter_authenticity_id`);

--
-- Indexen voor tabel `charter_language`
--
ALTER TABLE `charter_language`
  ADD PRIMARY KEY (`charter_language_id`);

--
-- Indexen voor tabel `charter_nature`
--
ALTER TABLE `charter_nature`
  ADD PRIMARY KEY (`charter_nature_id`);

--
-- Indexen voor tabel `charter_type`
--
ALTER TABLE `charter_type`
  ADD PRIMARY KEY (`charter_type_id`);

--
-- Indexen voor tabel `charter_udt`
--
ALTER TABLE `charter_udt`
  ADD PRIMARY KEY (`charter_udt_id`),
  ADD KEY `index_cudt_dibe_id` (`charter_id`);

--
-- Indexen voor tabel `charter__actor`
--
ALTER TABLE `charter__actor`
  ADD PRIMARY KEY (`charter__actor_id`),
  ADD UNIQUE KEY `charter_id` (`charter_id`,`actor_id`,`charter_actor_role_id`),
  ADD KEY `index_ca_dibe_id` (`charter_id`),
  ADD KEY `index_ca_actor_id` (`actor_id`),
  ADD KEY `published` (`published`),
  ADD KEY `charter__actor__charter_actor_role_id_idx` (`charter_actor_role_id`) USING BTREE;

--
-- Indexen voor tabel `charter__charter_language`
--
ALTER TABLE `charter__charter_language`
  ADD PRIMARY KEY (`charter__charter_language_id`),
  ADD UNIQUE KEY `dummy_id` (`charter__charter_language_id`),
  ADD KEY `index_cl_dibe_id` (`charter_id`),
  ADD KEY `charter__charter_language_charter_id_idx` (`charter_id`) USING BTREE,
  ADD KEY `charter__charter_language__charter_language_id_idx` (`charter_language_id`) USING BTREE;

--
-- Indexen voor tabel `charter__charter_type`
--
ALTER TABLE `charter__charter_type`
  ADD PRIMARY KEY (`charter__charter_type_id`),
  ADD UNIQUE KEY `dummy_id` (`charter__charter_type_id`),
  ADD KEY `index_ct_dibe_id` (`charter_id`),
  ADD KEY `charter__charter_type_charter_id_idx` (`charter_id`) USING BTREE,
  ADD KEY `charter__charter_type__charter_type_id_idx` (`charter_type_id`) USING BTREE;

--
-- Indexen voor tabel `charter__codex`
--
ALTER TABLE `charter__codex`
  ADD PRIMARY KEY (`charter__codex_id`),
  ADD KEY `index_cc_dibe_id` (`charter_id`),
  ADD KEY `index_cc_codex_id` (`codex_id`),
  ADD KEY `published` (`published`);

--
-- Indexen voor tabel `charter__codex_url`
--
ALTER TABLE `charter__codex_url`
  ADD PRIMARY KEY (`charter__codex_url_id`),
  ADD UNIQUE KEY `dummy_id` (`charter__codex_url_id`),
  ADD KEY `ccu_cc_dibe_id` (`charter_id`,`codex_id`),
  ADD KEY `index_ccu_cc_dibe_id` (`charter_id`),
  ADD KEY `index_ccu_cc_codex_id` (`codex_id`),
  ADD KEY `index_charter_codex_url_url` (`url`(330));

--
-- Indexen voor tabel `charter__edition_indication`
--
ALTER TABLE `charter__edition_indication`
  ADD PRIMARY KEY (`charter__edition_indication_id`),
  ADD KEY `cei_edition_indication_id` (`edition_indication_id`,`edition_id`),
  ADD KEY `index_cei_dibe_id` (`charter_id`),
  ADD KEY `index_cei_edition_indication_id` (`edition_indication_id`),
  ADD KEY `index_cei_edition_indication_edition_id` (`edition_id`),
  ADD KEY `published` (`published`);

--
-- Indexen voor tabel `charter__secondary_literature_indication`
--
ALTER TABLE `charter__secondary_literature_indication`
  ADD PRIMARY KEY (`charter__secondary_literature_indication_id`),
  ADD KEY `csli_secondary_literature_indication_id` (`secondary_literature_indication_id`,`secondary_literature_id`),
  ADD KEY `index_csli_dibe_id` (`charter_id`),
  ADD KEY `index_csli_secondary_literature_indication_id` (`secondary_literature_indication_id`),
  ADD KEY `index_csli_slisl_id` (`secondary_literature_id`),
  ADD KEY `published` (`published`);

--
-- Indexen voor tabel `codex`
--
ALTER TABLE `codex`
  ADD PRIMARY KEY (`codex_id`),
  ADD UNIQUE KEY `index_codex_repository_reference_number` (`repository_id`,`repository_reference_number`),
  ADD KEY `index_codex_repository_id` (`repository_id`),
  ADD KEY `codex_repository_published` (`repository_published`),
  ADD KEY `codex_repository_id` (`repository_id`);

--
-- Indexen voor tabel `codex_external_image_url`
--
ALTER TABLE `codex_external_image_url`
  ADD PRIMARY KEY (`codex_external_image_url_id`),
  ADD KEY `index_ceiu_codex_id` (`codex_id`),
  ADD KEY `index_codex_external_image_url_url` (`url`(330));

--
-- Indexen voor tabel `codex_institution`
--
ALTER TABLE `codex_institution`
  ADD PRIMARY KEY (`codex_institution_id`);

--
-- Indexen voor tabel `codex_material`
--
ALTER TABLE `codex_material`
  ADD PRIMARY KEY (`codex_material_id`);

--
-- Indexen voor tabel `codex_name_author`
--
ALTER TABLE `codex_name_author`
  ADD PRIMARY KEY (`codex_name_author_id`),
  ADD KEY `index_cna_codex_id` (`codex_id`),
  ADD KEY `index_codex_name_author_name` (`name`(330));

--
-- Indexen voor tabel `codex_url`
--
ALTER TABLE `codex_url`
  ADD PRIMARY KEY (`codex_url_id`),
  ADD KEY `index_cu_codex_id` (`codex_id`),
  ADD KEY `index_codex_url_url` (`url`(330));

--
-- Indexen voor tabel `codex__codex_institution`
--
ALTER TABLE `codex__codex_institution`
  ADD PRIMARY KEY (`codex__codex_institution_id`),
  ADD KEY `index_cii_codex_id` (`codex_id`),
  ADD KEY `codex__codex_institution__codex_institution_id_idx` (`codex_institution_id`) USING BTREE;

--
-- Indexen voor tabel `codex__codex_material`
--
ALTER TABLE `codex__codex_material`
  ADD PRIMARY KEY (`codex__codex_material_id`),
  ADD KEY `index_cm_codex_id` (`codex_id`),
  ADD KEY `codex__codex_material__codex_material_id_idx` (`codex_material_id`) USING BTREE;

--
-- Indexen voor tabel `copy`
--
ALTER TABLE `copy`
  ADD PRIMARY KEY (`copy_id`),
  ADD KEY `index_copy_dibe_id` (`charter_id`),
  ADD KEY `index_copy_codex_id` (`codex_id`),
  ADD KEY `index_copy_repository_id` (`repository_id`),
  ADD KEY `index_copy_codex_pof` (`codex_pof`),
  ADD KEY `index_copy_codex_sequence_number` (`codex_sequence_number`),
  ADD KEY `index_copy_repository_reference_number` (`repository_reference_number`),
  ADD KEY `published` (`published`),
  ADD KEY `copy_codex_published` (`codex_published`),
  ADD KEY `copy_charter_published` (`charter_published`),
  ADD KEY `copy_repository_published` (`repository_published`);

--
-- Indexen voor tabel `copy_external_image_url`
--
ALTER TABLE `copy_external_image_url`
  ADD PRIMARY KEY (`copy_external_image_url_id`),
  ADD UNIQUE KEY `dummy_id` (`copy_external_image_url_id`),
  ADD KEY `index_ceiu_copy_id` (`copy_id`),
  ADD KEY `index_copy_external_image_url_url` (`url`(330));

--
-- Indexen voor tabel `copy_url`
--
ALTER TABLE `copy_url`
  ADD PRIMARY KEY (`copy_url_id`),
  ADD UNIQUE KEY `dummy_id` (`copy_url_id`),
  ADD KEY `index_cu_copy_id` (`copy_id`),
  ADD KEY `index_copy_url_url` (`url`(330));

--
-- Indexen voor tabel `datation`
--
ALTER TABLE `datation`
  ADD PRIMARY KEY (`datation_id`),
  ADD KEY `index_datation_dibe_id` (`charter_id`),
  ADD KEY `index_datation_researcher` (`researcher`(330)),
  ADD KEY `index_datation_preference` (`preference`),
  ADD KEY `published` (`published`),
  ADD KEY `datation_charter_published` (`charter_published`);

--
-- Indexen voor tabel `datation_time`
--
ALTER TABLE `datation_time`
  ADD PRIMARY KEY (`datation_time_id`),
  ADD UNIQUE KEY `index_time_unique_general` (`year`,`month`,`day`,`interpretation`,`datation_id`),
  ADD KEY `index_time_datation_id` (`datation_id`),
  ADD KEY `time_datation_published` (`datation_published`),
  ADD KEY `published` (`published`),
  ADD KEY `datation_time__datation_time_originality_id_idx` (`datation_time_originality_id`) USING BTREE;

--
-- Indexen voor tabel `datation_time_originality`
--
ALTER TABLE `datation_time_originality`
  ADD PRIMARY KEY (`datation_time_originality_id`);

--
-- Indexen voor tabel `diocese`
--
ALTER TABLE `diocese`
  ADD PRIMARY KEY (`diocese_id`);

--
-- Indexen voor tabel `edition`
--
ALTER TABLE `edition`
  ADD PRIMARY KEY (`edition_id`),
  ADD UNIQUE KEY `edition_id` (`edition_id`),
  ADD KEY `index_edition_full_title` (`full_title`(330)),
  ADD KEY `index_names_editors` (`names_editors`(330)),
  ADD KEY `index_date_of_edition_year` (`date_of_edition_year`),
  ADD KEY `index_date_of_edition_month` (`date_of_edition_month`),
  ADD KEY `index_date_of_edition_day` (`date_of_edition_day`),
  ADD KEY `index_edition_comments` (`comments`(330));

--
-- Indexen voor tabel `edition_indication`
--
ALTER TABLE `edition_indication`
  ADD PRIMARY KEY (`edition_indication_id`,`edition_id`),
  ADD KEY `index_edition_indication_edition_id` (`edition_id`),
  ADD KEY `index_edition_indication_bookpart` (`bookpart`),
  ADD KEY `index_edition_indication_nr` (`nr`),
  ADD KEY `index_edition_indication_pages` (`pages`);

--
-- Indexen voor tabel `edition_indication_url`
--
ALTER TABLE `edition_indication_url`
  ADD PRIMARY KEY (`edition_indication_url_id`),
  ADD UNIQUE KEY `dummy_id` (`edition_indication_url_id`),
  ADD KEY `eiu_edition_indication_id` (`edition_indication_id`,`edition_id`),
  ADD KEY `index_eiu_edition_indication_id` (`edition_indication_id`),
  ADD KEY `index_eiu_edition_indication_edition_id` (`edition_id`),
  ADD KEY `index_edition_indication_url_url` (`url`(330));

--
-- Indexen voor tabel `edition_url`
--
ALTER TABLE `edition_url`
  ADD PRIMARY KEY (`edition_url_id`),
  ADD UNIQUE KEY `dummy_id` (`edition_url_id`),
  ADD KEY `index_eu_edition_id` (`edition_id`),
  ADD KEY `index_edition_url_url` (`url`(330));

--
-- Indexen voor tabel `flag`
--
ALTER TABLE `flag`
  ADD PRIMARY KEY (`flag_id`),
  ADD UNIQUE KEY `flag_id` (`flag_id`);

--
-- Indexen voor tabel `ikvti`
--
ALTER TABLE `ikvti`
  ADD PRIMARY KEY (`ikvti_id`),
  ADD UNIQUE KEY `ikvti_id` (`ikvti_id`),
  ADD KEY `index_ikvti_datation_id` (`ikvti_datation_id`);

--
-- Indexen voor tabel `image`
--
ALTER TABLE `image`
  ADD PRIMARY KEY (`image_id`),
  ADD UNIQUE KEY `image_id` (`image_id`),
  ADD UNIQUE KEY `index_image_original_sequence_number` (`original_id`,`original_sequence_number`),
  ADD UNIQUE KEY `index_image_copy_sequence_number` (`copy_id`,`copy_sequence_number`),
  ADD UNIQUE KEY `index_image_codex_sequence_number` (`codex_id`,`codex_sequence_number`),
  ADD KEY `index_image_original_id` (`original_id`),
  ADD KEY `index_image_copy_id` (`copy_id`),
  ADD KEY `index_image_codex_id` (`codex_id`);

--
-- Indexen voor tabel `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`log_id`),
  ADD UNIQUE KEY `log_id` (`log_id`),
  ADD KEY `log_person_accountname` (`log_person_accountname`);

--
-- Indexen voor tabel `original`
--
ALTER TABLE `original`
  ADD PRIMARY KEY (`original_id`),
  ADD KEY `index_original_dibe_id` (`charter_id`),
  ADD KEY `index_original_codex_id` (`codex_id`),
  ADD KEY `index_original_repository_id` (`repository_id`),
  ADD KEY `index_original_repository_reference_number` (`repository_reference_number`);

--
-- Indexen voor tabel `original_external_image_url`
--
ALTER TABLE `original_external_image_url`
  ADD PRIMARY KEY (`original_external_image_url_id`),
  ADD UNIQUE KEY `dummy_id` (`original_external_image_url_id`),
  ADD KEY `index_oeiu_original_id` (`original_id`),
  ADD KEY `index_original_external_image_url_url` (`url`(330));

--
-- Indexen voor tabel `original_url`
--
ALTER TABLE `original_url`
  ADD PRIMARY KEY (`original_url_id`),
  ADD UNIQUE KEY `dummy_id` (`original_url_id`),
  ADD KEY `index_ou_original_id` (`original_id`),
  ADD KEY `index_original_url_url` (`url`(330));

--
-- Indexen voor tabel `place`
--
ALTER TABLE `place`
  ADD PRIMARY KEY (`place_id`),
  ADD UNIQUE KEY `place_id` (`place_id`),
  ADD KEY `index_place_localisation_id` (`place_localisation_id`),
  ADD KEY `index_place_name_nl` (`name_nl`(330)),
  ADD KEY `index_place_name_fr` (`name_fr`(330)),
  ADD KEY `index_place_name_en` (`name_en`(330)),
  ADD KEY `index_place_name_regio` (`name_regio`(330)),
  ADD KEY `index_latitude` (`latitude`(330)),
  ADD KEY `index_longitude` (`longitude`(330)),
  ADD KEY `index_diocese_explanation_nl` (`diocese_explanation_nl`(330)),
  ADD KEY `index_diocese_explanation_fr` (`diocese_explanation_fr`(330)),
  ADD KEY `index_diocese_explanation_en` (`diocese_explanation_en`(330)),
  ADD KEY `index_principality_explanation_nl` (`principality_explanation_nl`(330)),
  ADD KEY `index_principality_explanation_fr` (`principality_explanation_fr`(330)),
  ADD KEY `index_principality_explanation_en` (`principality_explanation_en`(330)),
  ADD KEY `index_place_url` (`url`(330)),
  ADD KEY `place__diocese_id_idx` (`diocese_id`) USING BTREE,
  ADD KEY `place__principality_id_idx` (`principality_id`) USING BTREE;

--
-- Indexen voor tabel `place_localisation`
--
ALTER TABLE `place_localisation`
  ADD PRIMARY KEY (`place_localisation_id`),
  ADD UNIQUE KEY `localisation_id` (`place_localisation_id`),
  ADD KEY `index_echelon_1_nl` (`echelon_1_nl`(330)),
  ADD KEY `index_echelon_1_fr` (`echelon_1_fr`(330)),
  ADD KEY `index_echelon_1_en` (`echelon_1_en`(330)),
  ADD KEY `index_echelon_2_nl` (`echelon_2_nl`(330)),
  ADD KEY `index_echelon_2_fr` (`echelon_2_fr`(330)),
  ADD KEY `index_echelon_2_en` (`echelon_2_en`(330)),
  ADD KEY `index_echelon_3_nl` (`echelon_3_nl`(330)),
  ADD KEY `index_echelon_3_fr` (`echelon_3_fr`(330)),
  ADD KEY `index_echelon_3_en` (`echelon_3_en`(330)),
  ADD KEY `index_echelon_4_nl` (`echelon_4_nl`(330)),
  ADD KEY `index_echelon_4_fr` (`echelon_4_fr`(330)),
  ADD KEY `index_echelon_4_en` (`echelon_4_en`(330)),
  ADD KEY `index_echelon_5_nl` (`echelon_5_nl`(330)),
  ADD KEY `index_echelon_5_fr` (`echelon_5_fr`(330)),
  ADD KEY `index_echelon_5_en` (`echelon_5_en`(330)),
  ADD KEY `place_localisation__place_localisation_land_id_idx` (`place_localisation_land_id`) USING BTREE;

--
-- Indexen voor tabel `place_localisation_land`
--
ALTER TABLE `place_localisation_land`
  ADD PRIMARY KEY (`place_localisation_land_id`);

--
-- Indexen voor tabel `principality`
--
ALTER TABLE `principality`
  ADD PRIMARY KEY (`principality_id`);

--
-- Indexen voor tabel `repository`
--
ALTER TABLE `repository`
  ADD PRIMARY KEY (`repository_id`),
  ADD UNIQUE KEY `repository_id` (`repository_id`),
  ADD KEY `index_repository_name_nl` (`name_nl`(330)),
  ADD KEY `index_repository_name_fr` (`name_fr`(330)),
  ADD KEY `index_repository_name_en` (`name_en`(330)),
  ADD KEY `index_repository_location_nl` (`location_nl`(330)),
  ADD KEY `index_repository_location_fr` (`location_fr`(330)),
  ADD KEY `index_repository_location_en` (`location_en`(330)),
  ADD KEY `index_repository_class_nl` (`class_nl`(330)),
  ADD KEY `index_repository_class_fr` (`class_fr`(330)),
  ADD KEY `index_repository_class_en` (`class_en`(330));

--
-- Indexen voor tabel `repository_url`
--
ALTER TABLE `repository_url`
  ADD PRIMARY KEY (`repository_url_id`),
  ADD UNIQUE KEY `dummy_id` (`repository_url_id`),
  ADD KEY `index_ru_repository_id` (`repository_id`),
  ADD KEY `index_repository_url_url` (`url`(330));

--
-- Indexen voor tabel `secondary_literature`
--
ALTER TABLE `secondary_literature`
  ADD PRIMARY KEY (`secondary_literature_id`),
  ADD UNIQUE KEY `secondary_literature_id` (`secondary_literature_id`),
  ADD KEY `index_secondary_literature_full_title` (`full_title`(330)),
  ADD KEY `index_names_authors` (`names_authors`(330)),
  ADD KEY `index_date_of_publication_year` (`date_of_publication_year`),
  ADD KEY `index_date_of_publication_month` (`date_of_publication_month`),
  ADD KEY `index_date_of_publication_day` (`date_of_publication_day`),
  ADD KEY `index_secondary_literature_comments` (`comments`(330));

--
-- Indexen voor tabel `secondary_literature_indication`
--
ALTER TABLE `secondary_literature_indication`
  ADD PRIMARY KEY (`secondary_literature_indication_id`,`secondary_literature_id`),
  ADD KEY `index_secondary_literature_indication_secondary_literature_id` (`secondary_literature_id`),
  ADD KEY `index_secondary_literature_indication_bookpart` (`bookpart`),
  ADD KEY `index_secondary_literature_indication_nr` (`nr`),
  ADD KEY `index_secondary_literature_indication_pages` (`pages`);

--
-- Indexen voor tabel `secondary_literature_indication_url`
--
ALTER TABLE `secondary_literature_indication_url`
  ADD PRIMARY KEY (`secondary_literature_indication_url_id`),
  ADD UNIQUE KEY `dummy_id` (`secondary_literature_indication_url_id`),
  ADD KEY `sliu_secondary_literature_indication_id` (`secondary_literature_indication_id`,`secondary_literature_id`),
  ADD KEY `index_sliu_secondary_literature_indication_id` (`secondary_literature_indication_id`),
  ADD KEY `index_slisl_id` (`secondary_literature_id`),
  ADD KEY `index_secondary_literature_indication_url_url` (`url`(330));

--
-- Indexen voor tabel `secondary_literature_url`
--
ALTER TABLE `secondary_literature_url`
  ADD PRIMARY KEY (`secondary_literature_url_id`),
  ADD UNIQUE KEY `dummy_id` (`secondary_literature_url_id`),
  ADD KEY `index_slu_secondary_literature_id` (`secondary_literature_id`),
  ADD KEY `index_secondary_literature_url_url` (`url`(330));

--
-- Indexen voor tabel `vidimus`
--
ALTER TABLE `vidimus`
  ADD PRIMARY KEY (`vidimus_id`),
  ADD KEY `index_vidimus_dibe_id_1` (`charter_id`),
  ADD KEY `index_vidimus_dibe_id_2` (`related_charter_id`);

--
-- AUTO_INCREMENT voor geëxporteerde tabellen
--

--
-- AUTO_INCREMENT voor een tabel `actor`
--
ALTER TABLE `actor`
  MODIFY `actor_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `actor_capacity`
--
ALTER TABLE `actor_capacity`
  MODIFY `actor_capacity_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `actor_name`
--
ALTER TABLE `actor_name`
  MODIFY `actor_name_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `actor_name_variant`
--
ALTER TABLE `actor_name_variant`
  MODIFY `actor_name_variant_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `actor_order`
--
ALTER TABLE `actor_order`
  MODIFY `actor_order_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `actor_place_institute`
--
ALTER TABLE `actor_place_institute`
  MODIFY `actor_place_institute_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `actor_standardized_name`
--
ALTER TABLE `actor_standardized_name`
  MODIFY `actor_standardized_name_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter`
--
ALTER TABLE `charter`
  MODIFY `charter_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter_actor_role`
--
ALTER TABLE `charter_actor_role`
  MODIFY `charter_actor_role_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter_authenticity`
--
ALTER TABLE `charter_authenticity`
  MODIFY `charter_authenticity_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter_language`
--
ALTER TABLE `charter_language`
  MODIFY `charter_language_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter_nature`
--
ALTER TABLE `charter_nature`
  MODIFY `charter_nature_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter_type`
--
ALTER TABLE `charter_type`
  MODIFY `charter_type_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter_udt`
--
ALTER TABLE `charter_udt`
  MODIFY `charter_udt_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter__actor`
--
ALTER TABLE `charter__actor`
  MODIFY `charter__actor_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter__charter_language`
--
ALTER TABLE `charter__charter_language`
  MODIFY `charter__charter_language_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter__charter_type`
--
ALTER TABLE `charter__charter_type`
  MODIFY `charter__charter_type_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter__codex`
--
ALTER TABLE `charter__codex`
  MODIFY `charter__codex_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter__codex_url`
--
ALTER TABLE `charter__codex_url`
  MODIFY `charter__codex_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter__edition_indication`
--
ALTER TABLE `charter__edition_indication`
  MODIFY `charter__edition_indication_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `charter__secondary_literature_indication`
--
ALTER TABLE `charter__secondary_literature_indication`
  MODIFY `charter__secondary_literature_indication_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `codex`
--
ALTER TABLE `codex`
  MODIFY `codex_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `codex_external_image_url`
--
ALTER TABLE `codex_external_image_url`
  MODIFY `codex_external_image_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `codex_institution`
--
ALTER TABLE `codex_institution`
  MODIFY `codex_institution_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `codex_material`
--
ALTER TABLE `codex_material`
  MODIFY `codex_material_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `codex_name_author`
--
ALTER TABLE `codex_name_author`
  MODIFY `codex_name_author_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `codex_url`
--
ALTER TABLE `codex_url`
  MODIFY `codex_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `codex__codex_institution`
--
ALTER TABLE `codex__codex_institution`
  MODIFY `codex__codex_institution_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `codex__codex_material`
--
ALTER TABLE `codex__codex_material`
  MODIFY `codex__codex_material_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `copy`
--
ALTER TABLE `copy`
  MODIFY `copy_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `copy_external_image_url`
--
ALTER TABLE `copy_external_image_url`
  MODIFY `copy_external_image_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `copy_url`
--
ALTER TABLE `copy_url`
  MODIFY `copy_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `datation`
--
ALTER TABLE `datation`
  MODIFY `datation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `datation_time`
--
ALTER TABLE `datation_time`
  MODIFY `datation_time_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `datation_time_originality`
--
ALTER TABLE `datation_time_originality`
  MODIFY `datation_time_originality_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `diocese`
--
ALTER TABLE `diocese`
  MODIFY `diocese_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `edition`
--
ALTER TABLE `edition`
  MODIFY `edition_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `edition_indication`
--
ALTER TABLE `edition_indication`
  MODIFY `edition_indication_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `edition_indication_url`
--
ALTER TABLE `edition_indication_url`
  MODIFY `edition_indication_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `edition_url`
--
ALTER TABLE `edition_url`
  MODIFY `edition_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `flag`
--
ALTER TABLE `flag`
  MODIFY `flag_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `ikvti`
--
ALTER TABLE `ikvti`
  MODIFY `ikvti_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `image`
--
ALTER TABLE `image`
  MODIFY `image_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `log`
--
ALTER TABLE `log`
  MODIFY `log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `original`
--
ALTER TABLE `original`
  MODIFY `original_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `original_external_image_url`
--
ALTER TABLE `original_external_image_url`
  MODIFY `original_external_image_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `original_url`
--
ALTER TABLE `original_url`
  MODIFY `original_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `place`
--
ALTER TABLE `place`
  MODIFY `place_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `place_localisation`
--
ALTER TABLE `place_localisation`
  MODIFY `place_localisation_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `place_localisation_land`
--
ALTER TABLE `place_localisation_land`
  MODIFY `place_localisation_land_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `principality`
--
ALTER TABLE `principality`
  MODIFY `principality_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `repository`
--
ALTER TABLE `repository`
  MODIFY `repository_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `repository_url`
--
ALTER TABLE `repository_url`
  MODIFY `repository_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `secondary_literature`
--
ALTER TABLE `secondary_literature`
  MODIFY `secondary_literature_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `secondary_literature_indication`
--
ALTER TABLE `secondary_literature_indication`
  MODIFY `secondary_literature_indication_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `secondary_literature_indication_url`
--
ALTER TABLE `secondary_literature_indication_url`
  MODIFY `secondary_literature_indication_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `secondary_literature_url`
--
ALTER TABLE `secondary_literature_url`
  MODIFY `secondary_literature_url_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `vidimus`
--
ALTER TABLE `vidimus`
  MODIFY `vidimus_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Beperkingen voor geëxporteerde tabellen
--

--
-- Beperkingen voor tabel `actor`
--
ALTER TABLE `actor`
  ADD CONSTRAINT `actor__actor_order_id_fk` FOREIGN KEY (`actor_order_id`) REFERENCES `actor_order` (`actor_order_id`),
  ADD CONSTRAINT `actor__actor_place_institute_id_fk` FOREIGN KEY (`actor_place_institute_id`) REFERENCES `actor_place_institute` (`actor_place_institute_id`);

--
-- Beperkingen voor tabel `charter`
--
ALTER TABLE `charter`
  ADD CONSTRAINT `charter__charter_authenticity_id_fk` FOREIGN KEY (`charter_authenticity_id`) REFERENCES `charter_authenticity` (`charter_authenticity_id`),
  ADD CONSTRAINT `charter__charter_nature_id_fk` FOREIGN KEY (`charter_nature_id`) REFERENCES `charter_nature` (`charter_nature_id`);

--
-- Beperkingen voor tabel `charter__actor`
--
ALTER TABLE `charter__actor`
  ADD CONSTRAINT `charter__actor__charter_actor_role_id_fk` FOREIGN KEY (`charter_actor_role_id`) REFERENCES `charter_actor_role` (`charter_actor_role_id`);

--
-- Beperkingen voor tabel `charter__charter_language`
--
ALTER TABLE `charter__charter_language`
  ADD CONSTRAINT `charter__charter_language__charter_language_id_fk` FOREIGN KEY (`charter_language_id`) REFERENCES `charter_language` (`charter_language_id`),
  ADD CONSTRAINT `charter__charter_language_id_fk` FOREIGN KEY (`charter_id`) REFERENCES `charter` (`charter_id`);

--
-- Beperkingen voor tabel `charter__charter_type`
--
ALTER TABLE `charter__charter_type`
  ADD CONSTRAINT `charter__charter_type__charter_type_id_fk` FOREIGN KEY (`charter_type_id`) REFERENCES `charter_type` (`charter_type_id`),
  ADD CONSTRAINT `charter__charter_type_id_fk` FOREIGN KEY (`charter_id`) REFERENCES `charter` (`charter_id`);

--
-- Beperkingen voor tabel `codex__codex_institution`
--
ALTER TABLE `codex__codex_institution`
  ADD CONSTRAINT `codex__codex_institution__codex_institution_id_fk` FOREIGN KEY (`codex_institution_id`) REFERENCES `codex_institution` (`codex_institution_id`);

--
-- Beperkingen voor tabel `codex__codex_material`
--
ALTER TABLE `codex__codex_material`
  ADD CONSTRAINT `codex__codex_material__codex_material_id_fk` FOREIGN KEY (`codex_material_id`) REFERENCES `codex_material` (`codex_material_id`);

--
-- Beperkingen voor tabel `datation_time`
--
ALTER TABLE `datation_time`
  ADD CONSTRAINT `datation_time__datation_time_originality_id_fk` FOREIGN KEY (`datation_time_originality_id`) REFERENCES `datation_time_originality` (`datation_time_originality_id`);

--
-- Beperkingen voor tabel `place`
--
ALTER TABLE `place`
  ADD CONSTRAINT `place__diocese_id_fk` FOREIGN KEY (`diocese_id`) REFERENCES `diocese` (`diocese_id`),
  ADD CONSTRAINT `place__principality_id_fk` FOREIGN KEY (`principality_id`) REFERENCES `principality` (`principality_id`);

--
-- Beperkingen voor tabel `place_localisation`
--
ALTER TABLE `place_localisation`
  ADD CONSTRAINT `place_localisation__place_localisation_land_id_fk` FOREIGN KEY (`place_localisation_land_id`) REFERENCES `place_localisation_land` (`place_localisation_land_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
