package com.uni.impact.config;

import com.uni.impact.application.Application;
import com.uni.impact.application.ApplicationRepository;
import com.uni.impact.application.ApplicationStatus;
import com.uni.impact.attendance.Attendance;
import com.uni.impact.attendance.AttendanceRepository;
import com.uni.impact.attendance.AttendanceStatus;
import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.campaign.CampaignStatus;
import com.uni.impact.campaign_photo.CampaignPhoto;
import com.uni.impact.campaign_photo.CampaignPhotoRepository;
import com.uni.impact.category.Category;
import com.uni.impact.category.CategoryRepository;
import com.uni.impact.college.College;
import com.uni.impact.college.CollegeRepository;
import com.uni.impact.progress.Progress;
import com.uni.impact.progress.ProgressRepository;
import com.uni.impact.user.User;
import com.uni.impact.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Inserts default data on startup when tables are empty.
 * Safe to leave on in production — each table check fires only for fresh data.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CollegeRepository collegeRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final ApplicationRepository applicationRepository;
    private final AttendanceRepository attendanceRepository;
    private final ProgressRepository progressRepository;
    private final CampaignPhotoRepository campaignPhotoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedColleges();
        seedCategories();
        seedUsers();
        seedCampaigns();
        seedApplications();
        seedAttendance();
        seedProgressAndPhotos();
    }

    private void seedColleges() {
        if (collegeRepository.count() > 0) {
            return;
        }
        log.info("Seeding default colleges…");
        List<College> defaults = List.of(
                buildCollege("Information Technology Engineering",
                        "Software, networks, and information systems."),
                buildCollege("Architecture Engineering",
                        "Architectural design and built environment."),
                buildCollege("Faculty of Science",
                        "Mathematics, physics, biology, chemistry."),
                buildCollege("Faculty of Economics",
                        "Economics, finance, and business administration."),
                buildCollege("Faculty of Medicine",
                        "Medical and health sciences.")
        );
        collegeRepository.saveAll(defaults);
        log.info("Seeded {} colleges.", defaults.size());
    }

    private College buildCollege(String name, String description) {
        College c = new College();
        c.setName(name);
        c.setDescription(description);
        return c;
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }
        log.info("Seeding default categories…");
        List<Category> defaults = List.of(
                buildCategory("Environment"),
                buildCategory("Education"),
                buildCategory("Health"),
                buildCategory("Community Service"),
                buildCategory("Disaster Relief"),
                buildCategory("Animal Welfare")
        );
        categoryRepository.saveAll(defaults);
        log.info("Seeded {} categories.", defaults.size());
    }

    private Category buildCategory(String name) {
        Category c = new Category();
        c.setName(name);
        return c;
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            return;
        }
        List<College> colleges = collegeRepository.findAll();
        if (colleges.isEmpty()) {
            log.warn("No colleges available — skipping users seed.");
            return;
        }
        log.info("Seeding default users…");
        List<User> users = new ArrayList<>();
        users.add(buildUser("0000001", "Admin", "User", "admin@volunteer.local",
                "admin123", "0900000000", 1, colleges.get(0)));
        users.add(buildUser("0000002", "Sara", "Hassan", "sara@volunteer.local",
                "password123", "0911111111", 2, colleges.get(0)));
        users.add(buildUser("0000003", "Omar", "Khaled", "omar@volunteer.local",
                "password123", "0922222222", 3, colleges.get(1 % colleges.size())));
        users.add(buildUser("0000004", "Layla", "Ahmad", "layla@volunteer.local",
                "password123", "0933333333", 4, colleges.get(2 % colleges.size())));
        users.add(buildUser("0000005", "Yousef", "Salim", "yousef@volunteer.local",
                "password123", "0944444444", 2, colleges.get(3 % colleges.size())));
        users.add(buildUser("0000006", "Nour", "Mansour", "nour@volunteer.local",
                "password123", "0955555555", 1, colleges.get(4 % colleges.size())));
        userRepository.saveAll(users);
        log.info("Seeded {} users.", users.size());
    }

    private User buildUser(String studentNumber, String firstName, String lastName,
                           String email, String rawPassword, String phone,
                           Integer academicYear, College college) {
        User u = new User();
        u.setStudentNumber(studentNumber);
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setPhone(phone);
        u.setAcademicYear(academicYear);
        u.setIsBanned(false);
        u.setCollege(college);
        return u;
    }

    private void seedCampaigns() {
        if (campaignRepository.count() > 0) {
            return;
        }
        List<Category> categories = categoryRepository.findAll();
        List<User> users = userRepository.findAll();
        if (categories.isEmpty() || users.isEmpty()) {
            log.warn("Categories or users missing — skipping campaigns seed.");
            return;
        }
        User proposer = users.get(0);

        LocalDate today = LocalDate.now();
        List<Campaign> defaults = List.of(
                buildCampaign(
                        "Community Tree Planting Day",
                        "Plant 500 trees in the city park to expand the green belt.",
                        "Al-Mazzeh Park",
                        today.plusDays(7),
                        today.plusDays(7),
                        40,
                        CampaignStatus.APPROVED,
                        findCategory(categories, "Environment"),
                        proposer),
                buildCampaign(
                        "Weekend Tutoring for High School Students",
                        "Volunteer tutors help students prepare for finals in math and physics.",
                        "Main Public Library",
                        today.plusDays(3),
                        today.plusDays(30),
                        15,
                        CampaignStatus.ONGOING,
                        findCategory(categories, "Education"),
                        proposer),
                buildCampaign(
                        "Blood Donation Drive",
                        "Annual campus blood drive in cooperation with the National Blood Bank.",
                        "University Health Centre",
                        today.plusDays(14),
                        today.plusDays(14),
                        80,
                        CampaignStatus.PENDING,
                        findCategory(categories, "Health"),
                        proposer),
                buildCampaign(
                        "Neighborhood Cleanup",
                        "Half-day cleanup of the area surrounding the old town.",
                        "Old City District",
                        today.plusDays(10),
                        today.plusDays(10),
                        25,
                        CampaignStatus.APPROVED,
                        findCategory(categories, "Community Service"),
                        proposer),
                buildCampaign(
                        "Animal Shelter Volunteer Day",
                        "Help feed, walk, and care for rescued animals at the local shelter.",
                        "City Animal Shelter",
                        today.minusDays(20),
                        today.minusDays(15),
                        12,
                        CampaignStatus.COMPLETED,
                        findCategory(categories, "Animal Welfare"),
                        proposer)
        );
        campaignRepository.saveAll(defaults);
        log.info("Seeded {} campaigns.", defaults.size());
    }

    private Category findCategory(List<Category> categories, String name) {
        return categories.stream()
                .filter(c -> name.equalsIgnoreCase(c.getName()))
                .findFirst()
                .orElse(categories.get(0));
    }

    private Campaign buildCampaign(
            String title,
            String description,
            String location,
            LocalDate startDate,
            LocalDate endDate,
            int maxVolunteers,
            CampaignStatus status,
            Category category,
            User proposer) {
        Campaign c = new Campaign();
        c.setTitle(title);
        c.setDescription(description);
        c.setLocation(location);
        c.setStartDate(startDate);
        c.setEndDate(endDate);
        c.setMaxVolunteers(maxVolunteers);
        c.setStatus(status);
        c.setCategory(category);
        c.setProposedBy(proposer);
        return c;
    }

    private void seedApplications() {
        if (applicationRepository.count() > 0) {
            return;
        }
        List<Campaign> campaigns = campaignRepository.findAll();
        List<User> users = userRepository.findAll();
        if (campaigns.isEmpty() || users.size() < 2) {
            log.warn("Not enough campaigns or users — skipping applications seed.");
            return;
        }
        User admin = users.get(0);
        List<User> students = users.subList(1, users.size());

        LocalDateTime now = LocalDateTime.now();
        List<Application> apps = new ArrayList<>();
        for (int i = 0; i < campaigns.size(); i++) {
            Campaign campaign = campaigns.get(i);
            for (int j = 0; j < students.size(); j++) {
                User student = students.get(j);
                ApplicationStatus status = pickApplicationStatus(i, j);
                apps.add(buildApplication(campaign, student, admin, status, now.minusDays((long) i + j)));
            }
        }
        applicationRepository.saveAll(apps);
        log.info("Seeded {} applications.", apps.size());
    }

    private ApplicationStatus pickApplicationStatus(int campaignIndex, int studentIndex) {
        int pick = (campaignIndex + studentIndex) % 4;
        return switch (pick) {
            case 0 -> ApplicationStatus.APPROVED;
            case 1 -> ApplicationStatus.PENDING;
            case 2 -> ApplicationStatus.REJECTED;
            default -> ApplicationStatus.WITHDRAWN;
        };
    }

    private Application buildApplication(Campaign campaign, User student, User admin,
                                          ApplicationStatus status, LocalDateTime appliedAt) {
        Application a = new Application();
        a.setCampaign(campaign);
        a.setStudent(student);
        a.setStatus(status);
        a.setMotivationLetter("I am excited to contribute to " + campaign.getTitle() + ".");
        a.setAppliedAt(appliedAt);
        if (status == ApplicationStatus.APPROVED || status == ApplicationStatus.REJECTED) {
            a.setReviewedBy(admin);
            a.setReviewedAt(appliedAt.plusDays(1));
            if (status == ApplicationStatus.REJECTED) {
                a.setRejectionReason("Capacity reached for this campaign.");
            }
        }
        if (status == ApplicationStatus.WITHDRAWN) {
            a.setWithdrawnAt(appliedAt.plusDays(2));
        }
        return a;
    }

    private void seedAttendance() {
        if (attendanceRepository.count() > 0) {
            return;
        }
        List<Application> approved = applicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == ApplicationStatus.APPROVED)
                .toList();
        if (approved.isEmpty()) {
            log.warn("No approved applications — skipping attendance seed.");
            return;
        }
        List<User> users = userRepository.findAll();
        User admin = users.get(0);

        List<Attendance> records = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 0; i < approved.size(); i++) {
            Application app = approved.get(i);
            AttendanceStatus status = switch (i % 4) {
                case 0 -> AttendanceStatus.PRESENT;
                case 1 -> AttendanceStatus.LATE;
                case 2 -> AttendanceStatus.EXCUSED;
                default -> AttendanceStatus.ABSENT;
            };
            Attendance att = new Attendance();
            att.setCampaign(app.getCampaign());
            att.setStudent(app.getStudent());
            att.setRecordedBy(admin);
            att.setAttendanceDate(LocalDate.now().minusDays(i + 1L));
            att.setStatus(status);
            att.setHoursThatDay(status == AttendanceStatus.PRESENT ? 4.0
                    : status == AttendanceStatus.LATE ? 3.0 : 0.0);
            att.setNotes("Auto-seeded attendance record.");
            att.setRecordedAt(now.minusDays(i + 1L));
            records.add(att);
        }
        attendanceRepository.saveAll(records);
        log.info("Seeded {} attendance records.", records.size());
    }

    private void seedProgressAndPhotos() {
        boolean seedProgress = progressRepository.count() == 0;
        boolean seedPhotos = campaignPhotoRepository.count() == 0;
        if (!seedProgress && !seedPhotos) {
            return;
        }
        List<Campaign> campaigns = campaignRepository.findAll();
        List<User> users = userRepository.findAll();
        if (campaigns.isEmpty() || users.isEmpty()) {
            log.warn("Campaigns or users missing — skipping progress/photos seed.");
            return;
        }
        User admin = users.get(0);
        LocalDateTime now = LocalDateTime.now();

        List<Progress> progresses = new ArrayList<>();
        if (seedProgress) {
            int[] percentages = {25, 50, 75, 100, 10};
            for (int i = 0; i < campaigns.size(); i++) {
                Campaign campaign = campaigns.get(i);
                Progress p = new Progress();
                p.setCampaign(campaign);
                p.setUpdatedBy(admin);
                p.setPercentage(percentages[i % percentages.length]);
                p.setNotes("Initial progress entry for " + campaign.getTitle() + ".");
                progresses.add(p);
            }
            progressRepository.saveAll(progresses);
            log.info("Seeded {} progress records.", progresses.size());
        }

        if (seedPhotos) {
            List<Progress> linked = progresses.isEmpty()
                    ? progressRepository.findAll()
                    : progresses;
            List<CampaignPhoto> photos = new ArrayList<>();
            for (int i = 0; i < campaigns.size(); i++) {
                Campaign campaign = campaigns.get(i);
                Progress p = linked.isEmpty() ? null : linked.get(i % linked.size());
                CampaignPhoto photo = new CampaignPhoto();
                photo.setCampaign(campaign);
                photo.setProgress(p);
                photo.setPhotoUrl("https://placehold.co/600x400?text="
                        + campaign.getTitle().replace(' ', '+'));
                photo.setUploadedAt(now.minusDays(i + 1L));
                photos.add(photo);
            }
            campaignPhotoRepository.saveAll(photos);
            log.info("Seeded {} campaign photos.", photos.size());
        }
    }
}
