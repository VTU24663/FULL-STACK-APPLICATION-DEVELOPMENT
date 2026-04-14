import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class LoginServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String user = request.getParameter("username");
        String pass = request.getParameter("password");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/student_db", "root", "password");

            PreparedStatement ps = con.prepareStatement(
                    "SELECT * FROM users WHERE username=? AND password=?");

            ps.setString(1, user);
            ps.setString(2, pass);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                response.sendRedirect("dashboard");
            } else {
                PrintWriter out = response.getWriter();
                out.println("<h3 style='color:red'>Invalid Credentials</h3>");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}