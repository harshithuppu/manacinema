package com.movietheater.config;

import com.movietheater.model.*;
import com.movietheater.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initUsers();
        initMovies();
        initTheatersAndShows();
        initTelanganaTheaters();
        ensureBlockbusterMoviesAndUpcomingShows();
        System.out.println("✅ All demo seed data initialized successfully!");
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, Role.ERole.ROLE_CUSTOMER));
            roleRepository.save(new Role(null, Role.ERole.ROLE_THEATER_OWNER));
            roleRepository.save(new Role(null, Role.ERole.ROLE_ADMIN));
            System.out.println("✅ Roles created");
        }
    }

    private void initUsers() {
        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName(Role.ERole.ROLE_ADMIN).orElseThrow();
            Role ownerRole = roleRepository.findByName(Role.ERole.ROLE_THEATER_OWNER).orElseThrow();
            Role customerRole = roleRepository.findByName(Role.ERole.ROLE_CUSTOMER).orElseThrow();

            // Admin
            User admin = User.builder()
                .username("admin")
                .email("admin@movietheater.com")
                .password(passwordEncoder.encode("admin123"))
                .firstName("System")
                .lastName("Admin")
                .phoneNumber("1234567890")
                .roles(Set.of(adminRole))
                .enabled(true)
                .build();
            userRepository.save(admin);

            // Theater Owner
            User owner = User.builder()
                .username("owner")
                .email("owner@movietheater.com")
                .password(passwordEncoder.encode("owner123"))
                .firstName("Cinema")
                .lastName("Owner")
                .phoneNumber("9876543210")
                .roles(Set.of(ownerRole))
                .enabled(true)
                .build();
            userRepository.save(owner);

            // Customer
            User customer = User.builder()
                .username("customer")
                .email("customer@movietheater.com")
                .password(passwordEncoder.encode("customer123"))
                .firstName("John")
                .lastName("Doe")
                .phoneNumber("5551234567")
                .roles(Set.of(customerRole))
                .enabled(true)
                .build();
            userRepository.save(customer);

            System.out.println("✅ Users seeded: admin/admin123, owner/owner123, customer/customer123");
        }
    }

    private void initMovies() {
        if (movieRepository.count() == 0) {
            Movie dune2 = Movie.builder()
                .title("Dune: Part Two")
                .description("Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.")
                .genre("Sci-Fi, Action, Adventure")
                .language("English")
                .director("Denis Villeneuve")
                .cast("Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler")
                .releaseDate(LocalDate.now().minusMonths(1))
                .durationMinutes(166)
                .rating(8.6)
                .certification(Movie.Certification.UA)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=Way9Dexny3w")
                .build();

            Movie oppenheimer = Movie.builder()
                .title("Oppenheimer")
                .description("The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.")
                .genre("Biography, Drama, History")
                .language("English")
                .director("Christopher Nolan")
                .cast("Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.")
                .releaseDate(LocalDate.now().minusMonths(3))
                .durationMinutes(180)
                .rating(8.9)
                .certification(Movie.Certification.A)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=uYPbbksJxIg")
                .build();

            Movie interstellar = Movie.builder()
                .title("Interstellar")
                .description("When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers.")
                .genre("Adventure, Drama, Sci-Fi")
                .language("English")
                .director("Christopher Nolan")
                .cast("Matthew McConaughey, Anne Hathaway, Jessica Chastain")
                .releaseDate(LocalDate.now().minusYears(1))
                .durationMinutes(169)
                .rating(8.7)
                .certification(Movie.Certification.UA)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=zSWdZVtXT7E")
                .build();

            Movie inception = Movie.builder()
                .title("Inception")
                .description("A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.")
                .genre("Action, Adventure, Sci-Fi")
                .language("English")
                .director("Christopher Nolan")
                .cast("Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page")
                .releaseDate(LocalDate.now().minusYears(2))
                .durationMinutes(148)
                .rating(8.8)
                .certification(Movie.Certification.UA)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=YoHD9XEInc0")
                .build();

            Movie gladiator2 = Movie.builder()
                .title("Gladiator II")
                .description("Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered.")
                .genre("Action, Adventure, Drama")
                .language("English")
                .director("Ridley Scott")
                .cast("Paul Mescal, Pedro Pascal, Denzel Washington")
                .releaseDate(LocalDate.now().plusMonths(2))
                .durationMinutes(150)
                .rating(8.2)
                .certification(Movie.Certification.A)
                .status(Movie.MovieStatus.COMING_SOON)
                .posterUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=4rgYUipGJNo")
                .build();

            Movie avatar3 = Movie.builder()
                .title("Avatar: Fire and Ash")
                .description("Jake Sully and Neytiri encounter a new, aggressive volcanic clan of Na'vi known as the Ash People.")
                .genre("Action, Adventure, Fantasy, Sci-Fi")
                .language("English")
                .director("James Cameron")
                .cast("Sam Worthington, Zoe Saldana, Sigourney Weaver")
                .releaseDate(LocalDate.now().plusMonths(5))
                .durationMinutes(190)
                .rating(8.5)
                .certification(Movie.Certification.UA)
                .status(Movie.MovieStatus.COMING_SOON)
                .posterUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=d9MyW72ELq0")
                .build();

            movieRepository.saveAll(List.of(dune2, oppenheimer, interstellar, inception, gladiator2, avatar3));
            System.out.println("✅ Movies seeded");
        }
    }

    private void initTheatersAndShows() {
        if (theaterRepository.count() == 0) {
            User owner = userRepository.findByUsername("owner").orElse(null);

            Theater t1 = Theater.builder()
                .name("AMC Empire 25 & IMAX")
                .address("234 W 42nd St, Times Square")
                .city("New York")
                .state("NY")
                .pincode("10036")
                .phoneNumber("+1-212-398-3939")
                .email("amcempire@movietheater.com")
                .amenities("IMAX with Laser, Dolby Atmos, Luxury Recliners, Dine-In Bar")
                .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(t1);

            Theater t2 = Theater.builder()
                .name("Regal LA Live 4DX")
                .address("1000 W Olympic Blvd")
                .city("Los Angeles")
                .state("CA")
                .pincode("90015")
                .phoneNumber("+1-213-763-6070")
                .email("regallalive@movietheater.com")
                .amenities("4DX Motion Seats, Barco Laser, Dolby 7.1, Valet Parking")
                .imageUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(t2);

            // Create Screen for T1
            Screen screen1 = Screen.builder()
                .name("Screen 1 - IMAX Grand")
                .screenType(Screen.ScreenType.IMAX)
                .totalSeats(50)
                .theater(t1)
                .build();
            screenRepository.save(screen1);
            generateSeats(screen1);

            // Create Screen for T2
            Screen screen2 = Screen.builder()
                .name("Screen 1 - 4DX Dynamic")
                .screenType(Screen.ScreenType.FOUR_DX)
                .totalSeats(50)
                .theater(t2)
                .build();
            screenRepository.save(screen2);
            generateSeats(screen2);

            // Create Shows
            List<Movie> movies = movieRepository.findAll();
            if (!movies.isEmpty()) {
                Movie m1 = movies.get(0); // Dune 2
                Movie m2 = movies.size() > 1 ? movies.get(1) : m1; // Oppenheimer

                createShowForScreen(m1, screen1, LocalDateTime.now().plusHours(2), 14.50, 18.00, 24.00, 28.00);
                createShowForScreen(m2, screen1, LocalDateTime.now().plusHours(6), 15.00, 19.00, 25.00, 30.00);
                createShowForScreen(m1, screen2, LocalDateTime.now().plusHours(3), 16.00, 20.00, 26.00, 32.00);
            }

            System.out.println("✅ Theaters, screens, seats, and shows seeded");
        }
    }

    private void generateSeats(Screen screen) {
        // 5 rows (A, B, C, D, E) x 10 seats = 50 seats
        char[] rows = {'A', 'B', 'C', 'D', 'E'};
        for (int r = 0; r < rows.length; r++) {
            String rowName = String.valueOf(rows[r]);
            Seat.SeatType type = (r == 0 || r == 1) ? Seat.SeatType.VIP :
                                 (r == 2 || r == 3) ? Seat.SeatType.PREMIUM : Seat.SeatType.REGULAR;
            for (int num = 1; num <= 10; num++) {
                Seat seat = Seat.builder()
                    .screen(screen)
                    .rowName(rowName)
                    .seatNumber(num)
                    .seatType(type)
                    .build();
                seatRepository.save(seat);
            }
        }
    }

    private void createShowForScreen(Movie movie, Screen screen, LocalDateTime startTime, double regular, double premium, double vip, double recliner) {
        Show show = Show.builder()
            .movie(movie)
            .screen(screen)
            .startTime(startTime)
            .endTime(startTime.plusMinutes(movie.getDurationMinutes() != null ? movie.getDurationMinutes() : 120))
            .priceRegular(regular)
            .pricePremium(premium)
            .priceVip(vip)
            .priceRecliner(recliner)
            .status(Show.ShowStatus.SCHEDULED)
            .build();
        Show savedShow = showRepository.save(show);

        List<Seat> seats = seatRepository.findByScreen_Id(screen.getId());
        for (Seat seat : seats) {
            ShowSeat ss = ShowSeat.builder()
                .show(savedShow)
                .seat(seat)
                .status(ShowSeat.SeatStatus.AVAILABLE)
                .build();
            showSeatRepository.save(ss);
        }
    }

    private void initTelanganaTheaters() {
        if (theaterRepository.findByCity("Hyderabad").isEmpty()) {
            User owner = userRepository.findByUsername("owner").orElse(null);
            List<Movie> movies = movieRepository.findAll();
            Movie m1 = !movies.isEmpty() ? movies.get(0) : null;
            Movie m2 = movies.size() > 1 ? movies.get(1) : m1;

            // 1. Hyderabad - Prasads Multiplex & IMAX
            Theater tHyd1 = Theater.builder()
                .name("Prasads Multiplex & Large Screen")
                .address("Necklace Road, Khairatabad")
                .city("Hyderabad")
                .state("Telangana")
                .pincode("500004")
                .phoneNumber("+91-40-23448888")
                .email("prasads@manacinema.com")
                .amenities("Large Screen IMAX, Dolby Atmos 7.1, Luxury Recliners, Food Court")
                .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(tHyd1);
            Screen scHyd1 = Screen.builder().name("Screen 1 - Large Screen").screenType(Screen.ScreenType.IMAX).totalSeats(50).theater(tHyd1).build();
            screenRepository.save(scHyd1);
            generateSeats(scHyd1);
            if (m1 != null) createShowForScreen(m1, scHyd1, LocalDateTime.now().plusHours(2), 150.0, 250.0, 350.0, 400.0);
            if (m2 != null) createShowForScreen(m2, scHyd1, LocalDateTime.now().plusHours(6), 150.0, 250.0, 350.0, 400.0);

            // 2. Hyderabad - AMB Cinemas
            Theater tHyd2 = Theater.builder()
                .name("AMB Cinemas (Mahesh Babu)")
                .address("Gachibowli - Miyapur Road, Kothaguda")
                .city("Hyderabad")
                .state("Telangana")
                .pincode("500084")
                .phoneNumber("+91-40-29801234")
                .email("amb@manacinema.com")
                .amenities("Laser Projection, Dolby Atmos, VIP Lounge, M-Lounge")
                .imageUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(tHyd2);
            Screen scHyd2 = Screen.builder().name("Screen 1 - VIP Laser").screenType(Screen.ScreenType.FOUR_DX).totalSeats(50).theater(tHyd2).build();
            screenRepository.save(scHyd2);
            generateSeats(scHyd2);
            if (m1 != null) createShowForScreen(m1, scHyd2, LocalDateTime.now().plusHours(4), 180.0, 290.0, 380.0, 450.0);

            // 3. Warangal - Asian Sridevi Mall & Multiplex
            Theater tWarangal = Theater.builder()
                .name("Asian Sridevi Mall & Multiplex")
                .address("Main Road, Hanamkonda")
                .city("Warangal")
                .state("Telangana")
                .pincode("506001")
                .phoneNumber("+91-870-2445566")
                .email("warangal@manacinema.com")
                .amenities("Dolby 7.1, 4K Projection, Recliners, Food Court")
                .imageUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(tWarangal);
            Screen scWgl = Screen.builder().name("Screen 1 - 4K Dolby").screenType(Screen.ScreenType.STANDARD).totalSeats(50).theater(tWarangal).build();
            screenRepository.save(scWgl);
            generateSeats(scWgl);
            if (m1 != null) createShowForScreen(m1, scWgl, LocalDateTime.now().plusHours(3), 120.0, 200.0, 280.0, 320.0);

            // 4. Karimnagar - Tirumala Multiplex
            Theater tKarim = Theater.builder()
                .name("Tirumala Multiplex")
                .address("Mukarampura, Collectorate Road")
                .city("Karimnagar")
                .state("Telangana")
                .pincode("505001")
                .phoneNumber("+91-878-2233445")
                .email("karimnagar@manacinema.com")
                .amenities("Dolby Atmos, 4K Laser Projection, Pushback Seats")
                .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(tKarim);
            Screen scKrm = Screen.builder().name("Screen 1").screenType(Screen.ScreenType.STANDARD).totalSeats(50).theater(tKarim).build();
            screenRepository.save(scKrm);
            generateSeats(scKrm);
            if (m2 != null) createShowForScreen(m2, scKrm, LocalDateTime.now().plusHours(2), 120.0, 180.0, 250.0, 300.0);

            // 5. Nizamabad - Usha Multiplex
            Theater tNizam = Theater.builder()
                .name("Usha Multiplex")
                .address("Khaleelwadi Road")
                .city("Nizamabad")
                .state("Telangana")
                .pincode("503001")
                .phoneNumber("+91-8462-234567")
                .email("nizamabad@manacinema.com")
                .amenities("Qube 4K Digital, Dolby Surround Sound, Snack Counter")
                .imageUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(tNizam);
            Screen scNzm = Screen.builder().name("Screen 1").screenType(Screen.ScreenType.STANDARD).totalSeats(50).theater(tNizam).build();
            screenRepository.save(scNzm);
            generateSeats(scNzm);
            if (m1 != null) createShowForScreen(m1, scNzm, LocalDateTime.now().plusHours(5), 110.0, 170.0, 240.0, 280.0);

            // 6. Khammam - Srinivasa Complex & Dolby Atmos
            Theater tKham = Theater.builder()
                .name("Srinivasa Complex & Dolby Atmos")
                .address("Wyra Road, Bus Stand Area")
                .city("Khammam")
                .state("Telangana")
                .pincode("507001")
                .phoneNumber("+91-8742-223344")
                .email("khammam@manacinema.com")
                .amenities("Dolby Atmos 64-Channel, 4K Laser, Air Conditioned")
                .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(tKham);
            Screen scKhm = Screen.builder().name("Screen 1 - Atmos").screenType(Screen.ScreenType.STANDARD).totalSeats(50).theater(tKham).build();
            screenRepository.save(scKhm);
            generateSeats(scKhm);
            if (m2 != null) createShowForScreen(m2, scKhm, LocalDateTime.now().plusHours(4), 120.0, 180.0, 250.0, 300.0);

            // 7. Nalgonda - Sri Krishna Multiplex
            Theater tNalg = Theater.builder()
                .name("Sri Krishna Multiplex")
                .address("Clock Tower Center, Main Road")
                .city("Nalgonda")
                .state("Telangana")
                .pincode("508001")
                .phoneNumber("+91-8682-224466")
                .email("nalgonda@manacinema.com")
                .amenities("Dolby Digital, 4K Projection, Cafeteria")
                .imageUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(tNalg);
            Screen scNlg = Screen.builder().name("Screen 1").screenType(Screen.ScreenType.STANDARD).totalSeats(50).theater(tNalg).build();
            screenRepository.save(scNlg);
            generateSeats(scNlg);
            if (m1 != null) createShowForScreen(m1, scNlg, LocalDateTime.now().plusHours(3), 110.0, 160.0, 220.0, 260.0);

            // 8. Adilabad - Natraj Cinema
            Theater tAdil = Theater.builder()
                .name("Natraj Cinema")
                .address("Cinema Road, Near Collector Office")
                .city("Adilabad")
                .state("Telangana")
                .pincode("504001")
                .phoneNumber("+91-8732-221133")
                .email("adilabad@manacinema.com")
                .amenities("Digital 2K Sound, Dolby Digital, Pushback Seats")
                .imageUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800")
                .status(Theater.TheaterStatus.ACTIVE)
                .owner(owner)
                .build();
            theaterRepository.save(tAdil);
            Screen scAdl = Screen.builder().name("Screen 1").screenType(Screen.ScreenType.STANDARD).totalSeats(50).theater(tAdil).build();
            screenRepository.save(scAdl);
            generateSeats(scAdl);
            if (m2 != null) createShowForScreen(m2, scAdl, LocalDateTime.now().plusHours(2), 100.0, 150.0, 200.0, 240.0);

            System.out.println("✅ Real Telangana Theaters (Hyderabad, Warangal, Karimnagar, Nizamabad, Khammam, Nalgonda, Adilabad) seeded successfully!");
        }
    }

    private void ensureBlockbusterMoviesAndUpcomingShows() {
        // 1. Fix broken jalier2 movie record
        List<Movie> allMovies = movieRepository.findAll();
        for (Movie m : allMovies) {
            if ("jalier2".equalsIgnoreCase(m.getTitle())) {
                m.setTitle("Jailer 2");
                m.setPosterUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80");
                m.setBackdropUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80");
                m.setTrailerUrl("https://www.youtube.com/watch?v=bXmNxuWaa9U");
                m.setLanguage("Telugu");
                m.setRating(8.5);
                movieRepository.save(m);
            }
        }

        // 2. Ensure premier blockbusters exist
        String[] titles = {
            "Kalki 2898 AD",
            "Devara: Part 1",
            "Pushpa 2: The Rule",
            "Dune: Part Two",
            "Salaar: Part 1 - Ceasefire",
            "Oppenheimer",
            "Gladiator II",
            "Avatar: Fire and Ash"
        };

        for (String title : titles) {
            boolean exists = movieRepository.findAll().stream()
                .anyMatch(m -> m.getTitle().toLowerCase().contains(title.toLowerCase().substring(0, Math.min(6, title.length()))));
            if (!exists) {
                Movie m = buildMovieByTitle(title);
                if (m != null) {
                    movieRepository.save(m);
                }
            }
        }

        // 3. Ensure active upcoming shows for today and tomorrow across all screens
        List<Screen> allScreens = screenRepository.findAll();
        List<Movie> allNowShowing = movieRepository.findAll().stream()
            .filter(m -> m.getStatus() == Movie.MovieStatus.NOW_SHOWING)
            .toList();

        if (allNowShowing.isEmpty()) {
            allNowShowing = movieRepository.findAll();
        }

        if (!allScreens.isEmpty() && !allNowShowing.isEmpty()) {
            int movieIdx = 0;
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            int[] hours = {11, 14, 18, 21};

            for (Screen screen : allScreens) {
                // Ensure seats exist for screen
                if (seatRepository.findByScreen_Id(screen.getId()).isEmpty()) {
                    generateSeats(screen);
                }

                // Check future shows
                LocalDateTime now = LocalDateTime.now();
                long futureShows = showRepository.findAll().stream()
                    .filter(s -> s.getScreen() != null && s.getScreen().getId().equals(screen.getId()) && s.getStartTime().isAfter(now))
                    .count();

                if (futureShows < 2) {
                    Movie movieForScreen = allNowShowing.get(movieIdx % allNowShowing.size());
                    movieIdx++;

                    for (int h : hours) {
                        LocalDateTime showTimeToday = today.atTime(h, (h % 2 == 0 ? 30 : 0));
                        if (showTimeToday.isAfter(now)) {
                            createShowForScreen(movieForScreen, screen, showTimeToday, 150.0, 220.0, 300.0, 380.0);
                        }

                        LocalDateTime showTimeTomorrow = tomorrow.atTime(h, (h % 2 == 0 ? 30 : 0));
                        createShowForScreen(movieForScreen, screen, showTimeTomorrow, 150.0, 220.0, 300.0, 380.0);
                    }
                }
            }
        }
        System.out.println("✅ Blockbuster movies & active upcoming shows verified!");
    }

    private Movie buildMovieByTitle(String title) {
        if (title.contains("Kalki")) {
            return Movie.builder()
                .title("Kalki 2898 AD")
                .description("In a post-apocalyptic world in the year 2898 AD, a modern avatar of Vishnu descends to Earth to protect the world from evil forces.")
                .genre("Sci-Fi, Action")
                .language("Telugu")
                .director("Nag Ashwin")
                .cast("Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone")
                .releaseDate(LocalDate.now().minusMonths(2))
                .durationMinutes(181)
                .rating(8.5)
                .certification(Movie.Certification.UA)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80")
                .backdropUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=kQDd1AhGIHk")
                .build();
        } else if (title.contains("Devara")) {
            return Movie.builder()
                .title("Devara: Part 1")
                .description("An epic action saga set across coastal lands where a fearless chieftain fights to protect his people and legacy against treacherous foes.")
                .genre("Action, Drama")
                .language("Telugu")
                .director("Koratala Siva")
                .cast("N.T. Rama Rao Jr., Saif Ali Khan, Janhvi Kapoor")
                .releaseDate(LocalDate.now().minusWeeks(3))
                .durationMinutes(178)
                .rating(8.3)
                .certification(Movie.Certification.A)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80")
                .backdropUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1280&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=kQDd1AhGIHk")
                .build();
        } else if (title.contains("Pushpa")) {
            return Movie.builder()
                .title("Pushpa 2: The Rule")
                .description("Pushpa Raj solidifies his empire while facing fierce confrontation from SP Bhanwar Singh Shekhawat in a battle for supremacy.")
                .genre("Action, Thriller")
                .language("Telugu")
                .director("Sukumar")
                .cast("Allu Arjun, Rashmika Mandanna, Fahadh Faasil")
                .releaseDate(LocalDate.now().minusWeeks(1))
                .durationMinutes(185)
                .rating(9.0)
                .certification(Movie.Certification.UA)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80")
                .backdropUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=1kVK0MZlbI4")
                .build();
        } else if (title.contains("Dune")) {
            return Movie.builder()
                .title("Dune: Part Two")
                .description("Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.")
                .genre("Sci-Fi, Action, Adventure")
                .language("English")
                .director("Denis Villeneuve")
                .cast("Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler")
                .releaseDate(LocalDate.now().minusMonths(1))
                .durationMinutes(166)
                .rating(8.7)
                .certification(Movie.Certification.UA)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80")
                .backdropUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1280&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=Way9Dexny3w")
                .build();
        } else if (title.contains("Salaar")) {
            return Movie.builder()
                .title("Salaar: Part 1 - Ceasefire")
                .description("A gang leader makes a promise to a dying friend and takes on other criminal gangs in the brutal, fictional walled city-state of Khansaar.")
                .genre("Action, Crime")
                .language("Telugu")
                .director("Prashanth Neel")
                .cast("Prabhas, Prithviraj Sukumaran, Shruti Haasan")
                .releaseDate(LocalDate.now().minusMonths(4))
                .durationMinutes(175)
                .rating(8.4)
                .certification(Movie.Certification.A)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80")
                .backdropUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=4GPvYMKtrtI")
                .build();
        } else if (title.contains("Oppenheimer")) {
            return Movie.builder()
                .title("Oppenheimer")
                .description("The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.")
                .genre("Biography, Drama, History")
                .language("English")
                .director("Christopher Nolan")
                .cast("Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.")
                .releaseDate(LocalDate.now().minusMonths(3))
                .durationMinutes(180)
                .rating(8.9)
                .certification(Movie.Certification.A)
                .status(Movie.MovieStatus.NOW_SHOWING)
                .posterUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80")
                .backdropUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1280&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=uYPbbksJxIg")
                .build();
        } else if (title.contains("Gladiator")) {
            return Movie.builder()
                .title("Gladiator II")
                .description("Years after witnessing the death of the revered hero Maximus, Lucius enters the Colosseum after his home is conquered by tyrannous emperors.")
                .genre("Action, Adventure, Drama")
                .language("English")
                .director("Ridley Scott")
                .cast("Paul Mescal, Pedro Pascal, Denzel Washington")
                .releaseDate(LocalDate.now().plusMonths(2))
                .durationMinutes(150)
                .rating(8.2)
                .certification(Movie.Certification.A)
                .status(Movie.MovieStatus.COMING_SOON)
                .posterUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80")
                .backdropUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=4rgYUipGJNo")
                .build();
        } else if (title.contains("Avatar")) {
            return Movie.builder()
                .title("Avatar: Fire and Ash")
                .description("Jake Sully and Neytiri encounter a new, aggressive volcanic clan of Na'vi known as the Ash People.")
                .genre("Action, Adventure, Fantasy, Sci-Fi")
                .language("English")
                .director("James Cameron")
                .cast("Sam Worthington, Zoe Saldana, Sigourney Weaver")
                .releaseDate(LocalDate.now().plusMonths(5))
                .durationMinutes(190)
                .rating(8.5)
                .certification(Movie.Certification.UA)
                .status(Movie.MovieStatus.COMING_SOON)
                .posterUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80")
                .backdropUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&auto=format&fit=crop&q=80")
                .trailerUrl("https://www.youtube.com/watch?v=d9MyW72ELq0")
                .build();
        }
        return null;
    }
}
