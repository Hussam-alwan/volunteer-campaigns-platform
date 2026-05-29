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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Idempotent seed data.
 * - Reference tables (colleges, categories) are seeded only when empty.
 * - A known admin account is always ensured (created if missing) so you can log in.
 * - Sample students/campaigns/applications/attendance/progress are seeded only on a
 *   fresh database (when the respective tables are empty).
 *
 * Default logins (fresh DB):
 *   admin@impact.com / Admin@123        (staff)
 *   student1@impact.com .. student5@impact.com / Student@123
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    public static final String ADMIN_EMAIL = "admin@impact.com";
    public static final String ADMIN_PASSWORD = "Admin@123";
    public static final String STUDENT_PASSWORD = "Student@123";

    private final CollegeRepository collegeRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final ApplicationRepository applicationRepository;
    private final AttendanceRepository attendanceRepository;
    private final ProgressRepository progressRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        List<College> colleges = seedColleges();
        List<Category> categories = seedCategories();
        User admin = ensureAdmin(colleges.get(0));
        List<User> students = ensureStudents(colleges);

        if (campaignRepository.count() == 0) {
            List<Campaign> campaigns = seedCampaigns(categories, admin);
            seedApplications(students, campaigns, admin);
            seedAttendance(students, campaigns, admin);
            seedProgress(campaigns, admin);
        }

        log.info("DataSeeder finished. Admin login: {} / {}", ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    private List<College> seedColleges() {
        if (collegeRepository.count() > 0) {
            return collegeRepository.findAll();
        }
        String[] names = {
                "Information Technology Engineering",
                "Architecture Engineering",
                "Faculty of Science",
                "Faculty of Economics",
                "Faculty of Medicine"
        };
        List<College> list = new ArrayList<>();
        for (String name : names) {
            College c = new College();
            c.setName(name);
            c.setDescription(name + " department.");
            list.add(c);
        }
        list = collegeRepository.saveAll(list);
        log.info("Seeded {} colleges.", list.size());
        return list;
    }

    private List<Category> seedCategories() {
        if (categoryRepository.count() > 0) {
            return categoryRepository.findAll();
        }
        String[] names = {"Environment", "Education", "Health", "Community", "Relief", "Awareness"};
        List<Category> list = new ArrayList<>();
        for (String name : names) {
            Category c = new Category();
            c.setName(name);
            list.add(c);
        }
        list = categoryRepository.saveAll(list);
        log.info("Seeded {} categories.", list.size());
        return list;
    }

    private User ensureAdmin(College college) {
        return userRepository.findByEmailIgnoreCase(ADMIN_EMAIL).orElseGet(() -> {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmail(ADMIN_EMAIL);
            admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
            admin.setPhone("0500000000");
            admin.setStudentNumber(null); // no student number -> ROLE_STAFF
            admin.setAcademicYear(null);
            admin.setIsBanned(false);
            admin.setCollege(college);
            User saved = userRepository.save(admin);
            log.info("Created admin account {}", ADMIN_EMAIL);
            return saved;
        });
    }

    private List<User> ensureStudents(List<College> colleges) {
        List<User> students = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            if (u.getStudentNumber() != null) {
                students.add(u);
            }
        }
        if (!students.isEmpty()) {
            return students;
        }

        String[][] people = {
                {"Sara", "Khaled"},
                {"Omar", "Nabil"},
                {"Layla", "Hassan"},
                {"Yousef", "Ali"},
                {"Nour", "Ahmad"},
                {"Karim", "Saleh"},
                {"Rana", "Fares"},
                {"Hadi", "Sultan"},
                {"Maya", "Darwish"},
                {"Tarek", "Mansour"},
                {"Lina", "Aziz"},
                {"Samir", "Haddad"}
        };
        List<User> created = new ArrayList<>();
        for (int i = 0; i < people.length; i++) {
            User s = new User();
            s.setFirstName(people[i][0]);
            s.setLastName(people[i][1]);
            s.setEmail("student" + (i + 1) + "@impact.com");
            s.setPassword(passwordEncoder.encode(STUDENT_PASSWORD));
            s.setPhone("05000000" + String.format("%02d", i + 1));
            s.setStudentNumber(String.format("100000%d", i + 1));
            s.setAcademicYear((i % 5) + 1);
            s.setIsBanned(false);
            s.setCollege(colleges.get(i % colleges.size()));
            created.add(s);
        }
        created = userRepository.saveAll(created);
        log.info("Seeded {} students (password: {}).", created.size(), STUDENT_PASSWORD);
        return created;
    }

    private List<Campaign> seedCampaigns(List<Category> categories, User proposer) {
        record Seed(String title, String location, CampaignStatus status, int maxVol) {}
        Seed[] seeds = {
                new Seed("Beach Cleanup Drive", "Latakia Corniche", CampaignStatus.ONGOING, 40),
                new Seed("Coding for Kids", "IT Faculty Lab", CampaignStatus.ONGOING, 25),
                new Seed("Blood Donation Day", "University Clinic", CampaignStatus.APPROVED, 60),
                new Seed("Winter Relief Packages", "City Center", CampaignStatus.PENDING, 50),
                new Seed("Tree Planting Weekend", "Campus Gardens", CampaignStatus.COMPLETED, 30),
                new Seed("Food Bank Distribution", "Old Town Hall", CampaignStatus.ONGOING, 45),
                new Seed("Literacy Workshop", "Public Library", CampaignStatus.APPROVED, 20),
                new Seed("River Cleanup Initiative", "Al-Kabir River", CampaignStatus.PENDING, 35),
                new Seed("Elderly Care Visits", "Sunrise Care Home", CampaignStatus.ONGOING, 15),
                new Seed("Recycling Awareness Fair", "Main Square", CampaignStatus.COMPLETED, 55)
        };
        List<Campaign> list = new ArrayList<>();
        for (int i = 0; i < seeds.length; i++) {
            Seed s = seeds[i];
            Campaign c = new Campaign();
            c.setTitle(s.title());
            c.setDescription(s.title() + " - a volunteer initiative.");
            c.setLocation(s.location());
            c.setStartDate(LocalDate.now().minusDays(5).plusDays(i));
            c.setEndDate(LocalDate.now().plusDays(20 + i));
            c.setMaxVolunteers(s.maxVol());
            c.setStatus(s.status());
            if (s.status() != CampaignStatus.PENDING) {
                c.setPublishedAt(LocalDateTime.now().minusDays(3));
            }
            c.setCategory(categories.get(i % categories.size()));
            c.setProposedBy(proposer);
            list.add(c);
        }
        list = campaignRepository.saveAll(list);
        log.info("Seeded {} campaigns.", list.size());
        return list;
    }

    private void seedApplications(List<User> students, List<Campaign> campaigns, User reviewer) {
        if (students.isEmpty() || campaigns.isEmpty()) return;
        ApplicationStatus[] statuses = {
                ApplicationStatus.PENDING, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED
        };
        List<Application> list = new ArrayList<>();
        int n = 0;
        for (Campaign campaign : campaigns) {
            for (int j = 0; j < 3; j++) {
                User student = students.get((n) % students.size());
                Application a = new Application();
                a.setMotivationLetter("I am excited to volunteer for " + campaign.getTitle() + ".");
                a.setStatus(statuses[n % statuses.length]);
                a.setAppliedAt(LocalDateTime.now().minusDays(j + 1));
                a.setStudent(student);
                a.setCampaign(campaign);
                if (a.getStatus() != ApplicationStatus.PENDING) {
                    a.setReviewedAt(LocalDateTime.now());
                    a.setReviewedBy(reviewer);
                }
                list.add(a);
                n++;
            }
        }
        applicationRepository.saveAll(list);
        log.info("Seeded {} applications.", list.size());
    }

    private void seedAttendance(List<User> students, List<Campaign> campaigns, User recorder) {
        if (students.isEmpty() || campaigns.isEmpty()) return;
        AttendanceStatus[] statuses = {
                AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT
        };
        List<Attendance> list = new ArrayList<>();
        int n = 0;
        for (Campaign campaign : campaigns) {
            for (int j = 0; j < 2; j++) {
                User student = students.get(n % students.size());
                AttendanceStatus status = statuses[n % statuses.length];
                Attendance att = new Attendance();
                att.setAttendanceDate(LocalDate.now().minusDays(j));
                att.setStatus(status);
                att.setHoursThatDay(status == AttendanceStatus.ABSENT ? 0.0 : 4.0);
                att.setNotes(status == AttendanceStatus.ABSENT ? "No show" : "On time");
                att.setRecordedAt(LocalDateTime.now());
                att.setStudent(student);
                att.setCampaign(campaign);
                att.setRecordedBy(recorder);
                list.add(att);
                n++;
            }
        }
        attendanceRepository.saveAll(list);
        log.info("Seeded {} attendance records.", list.size());
    }

    private void seedProgress(List<Campaign> campaigns, User updatedBy) {
        if (campaigns.isEmpty()) return;
        List<Progress> list = new ArrayList<>();
        int[] pcts = {20, 45, 70, 90, 100};
        for (int i = 0; i < campaigns.size(); i++) {
            Progress p = new Progress();
            p.setPercentage(pcts[i % pcts.length]);
            p.setNotes("Progress update for " + campaigns.get(i).getTitle());
            p.setCampaign(campaigns.get(i));
            p.setUpdatedBy(updatedBy);
            list.add(p);
        }
        progressRepository.saveAll(list);
        log.info("Seeded {} progress records.", list.size());
    }
}
