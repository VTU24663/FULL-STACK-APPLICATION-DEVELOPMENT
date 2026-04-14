import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class RegisterServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String dob = request.getParameter("dob");
        String dept = request.getParameter("department");
        String phone = request.getParameter("phone");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/student_db", "root", "password");

            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO students(name,email,dob,department,phone) VALUES(?,?,?,?,?)");

            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, dob);
            ps.setString(4, dept);
            ps.setString(5, phone);

            ps.executeUpdate();

            response.sendRedirect("dashboard");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}